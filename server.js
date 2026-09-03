import express from 'express';
import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const CHALLENGE_FILE = path.join(DATA_DIR, 'challenges.json');
const REQUEST_FILE = path.join(DATA_DIR, 'approval-requests.json');
const USER_FILE = path.join(DATA_DIR, 'users.json');
const ADMIN_EMAIL = 'admin@samadhan.local';
const ADMIN_PASSWORD = 'admin123';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

fs.mkdirSync(DATA_DIR, { recursive: true });
for (const [file, initial] of [[CHALLENGE_FILE, []], [REQUEST_FILE, []], [USER_FILE, []]]) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(initial, null, 2) + '\n');
}

app.use(express.json({ limit: '4mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const clients = new Set();
const sessions = new Map();
const read = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
const cleanEmail = (email = '') => String(email).trim().toLowerCase();
const cleanText = (v = '') => String(v).trim();
const isUniversityEmail = (email) => /\.(ac\.in|edu\.in|edu)$/.test(cleanEmail(email));
const isAdminCredentials = (email, password) => cleanEmail(email) === ADMIN_EMAIL && password === ADMIN_PASSWORD;
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') });
const verifyPassword = (password, record) => {
  try {
    const a = Buffer.from(crypto.scryptSync(password, record.salt, 64).toString('hex'), 'hex');
    const b = Buffer.from(record.hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
};
const makeToken = () => crypto.randomBytes(32).toString('hex');
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, organization: u.organization, state: u.state, district: u.district });

function createSession(user) {
  const token = makeToken();
  sessions.set(token, { user: publicUser(user), expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}
function getSession(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) { sessions.delete(token); return null; }
  return session;
}
function actor(req) { return getSession(req)?.user || null; }
function requireAuth(req, res, next) { const u = actor(req); if (!u) return res.status(401).json({ error: 'Please sign in again.' }); req.user = u; next(); }
function requireAdmin(req, res, next) { if (!actor(req) || actor(req).role !== 'admin' || actor(req).email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Admin access required.' }); req.user = actor(req); next(); }

function broadcast(type, payload = {}) {
  const msg = `data: ${JSON.stringify({ type, ...payload })}\n\n`;
  for (const res of clients) { try { res.write(msg); } catch { clients.delete(res); } }
}
async function notifyAdmin(type, payload) {
  broadcast(type, payload);
  const webhook = process.env.ADMIN_ALERT_WEBHOOK_URL;
  if (webhook) {
    try { await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'samadhan', type, ...payload }) }); } catch { /* webhook is optional */ }
  }
}
function addTimeline(c, label, by, note, status = c.status) {
  c.timeline = [...(c.timeline || []), { id: `t-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, label, actor: by, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), note, status }];
}
function tokens(text) { return new Set(cleanText(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(x => x.length > 2)); }
function similarity(a, b) {
  const A = tokens(a), B = tokens(b); if (!A.size || !B.size) return 0;
  let common = 0; for (const x of A) if (B.has(x)) common++;
  return common / (A.size + B.size - common);
}

// ---------- Authentication ----------
app.post('/api/auth/signup', (req, res) => {
  const b = req.body || {};
  const role = ['citizen', 'university', 'industry'].includes(b.role) ? b.role : null;
  const name = cleanText(b.name), email = cleanEmail(b.email), password = String(b.password || ''), organization = cleanText(b.organization), state = cleanText(b.state);
  if (!role) return res.status(400).json({ error: 'Choose Citizen, University or Industry.' });
  if (name.length < 2 || !email.includes('@') || password.length < 8) return res.status(400).json({ error: 'Enter a valid name, email and password of at least 8 characters.' });
  if ((role === 'university' || role === 'industry') && !organization) return res.status(400).json({ error: 'Organization name is required.' });
  if (role === 'university' && !isUniversityEmail(email)) return res.status(400).json({ error: 'University accounts must use an official institutional email such as name@college.ac.in. Personal email addresses are not accepted.' });
  if (email === ADMIN_EMAIL) return res.status(409).json({ error: 'That email is reserved for the sole platform Admin.' });
  const users = read(USER_FILE);
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  const { salt, hash } = hashPassword(password);
  const user = { id: `u-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, name, email, role, organization: organization || undefined, state: state || undefined, createdAt: new Date().toISOString(), password: { salt, hash } };
  users.push(user); write(USER_FILE, users);
  const token = createSession(user);
  res.status(201).json({ user: publicUser(user), token });
});

app.post('/api/auth/login', (req, res) => {
  const email = cleanEmail(req.body?.email), password = String(req.body?.password || '');
  if (isAdminCredentials(email, password)) {
    const admin = { id: 'admin-sole', name: 'Samadhan Admin', email: ADMIN_EMAIL, role: 'admin', organization: 'Samadhan Platform' };
    return res.json({ user: admin, token: createSession(admin) });
  }
  const user = read(USER_FILE).find(u => u.email === email);
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ error: 'Incorrect email or password.' });
  res.json({ user: publicUser(user), token: createSession(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user }));
app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  sessions.delete(token); res.json({ ok: true });
});

// ---------- Realtime ----------
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache, no-transform'); res.setHeader('Connection', 'keep-alive'); res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`); clients.add(res); req.on('close', () => clients.delete(res));
});

// ---------- Challenges ----------
app.get('/api/challenges', (req, res) => { const u = actor(req); const cs = read(CHALLENGE_FILE); if (u?.role === 'admin') return res.json(cs); const visible = cs.filter(c => c.status !== 'pending' || (u && c.submittedByEmail === u.email)); res.json(visible); });
app.post('/api/challenges', requireAuth, async (req, res) => {
  const u = req.user, b = req.body || {};
  const title = cleanText(b.title), description = cleanText(b.description), domain = cleanText(b.domain), state = cleanText(b.state), district = cleanText(b.district), city = cleanText(b.city), pincode = cleanText(b.pincode);
  if (title.length < 12 || description.length < 40 || !domain || !state || district.length < 2 || city.length < 2 || !/^[1-9][0-9]{5}$/.test(pincode)) return res.status(400).json({ error: 'Title, description and complete Indian location are required.' });
  const challenges = read(CHALLENGE_FILE);
  const possible = challenges.map(c => ({ c, score: similarity(`${title} ${description}`, `${c.title} ${c.description}`) })).filter(x => x.score >= 0.42 && x.c.state === state && x.c.district.toLowerCase() === district.toLowerCase()).sort((a,b)=>b.score-a.score)[0];
  const id = `c-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const challenge = {
    ...b, id, title, description, domain, country: 'India', state, district, city, pincode,
    reference: `IN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'pending', submittedBy: u.name, submittedByEmail: u.email, submittedByRole: u.role, submittedAt: new Date().toISOString(), supporters: 1, duplicatesMerged: 0,
    duplicateCandidate: possible ? { challengeId: possible.c.id, reference: possible.c.reference, score: Math.round(possible.score * 100) } : undefined,
    timeline: [{ id: 't1', status: 'pending', label: 'Submitted — pending Admin approval', actor: u.name, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), note: 'Queued for the sole Samadhan Admin.' }]
  };
  challenges.unshift(challenge); write(CHALLENGE_FILE, challenges);
  const requests = read(REQUEST_FILE); const request = { id: `r-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, type: 'challenge', status: 'pending', title: `New challenge: ${title}`, message: `${u.name} submitted a new challenge for Admin review.`, requesterName: u.name, requesterEmail: u.email, requesterRole: u.role, organization: u.organization, challengeId: id, createdAt: new Date().toISOString() };
  requests.unshift(request); write(REQUEST_FILE, requests);
  await notifyAdmin('challenge-submitted', { challenge, request, requester: { name: u.name, email: u.email, role: u.role, organization: u.organization } });
  res.status(201).json(challenge);
});

app.post('/api/challenges/:id/claim', requireAuth, async (req, res) => {
  const u = req.user; if (u.role !== 'university') return res.status(403).json({ error: 'Only university users can apply a team.' });
  const teamName = cleanText(req.body?.teamName); if (teamName.length < 3) return res.status(400).json({ error: 'Enter a team name.' });
  const challenges = read(CHALLENGE_FILE), c = challenges.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' });
  if (c.status !== 'review') return res.status(409).json({ error: 'Only Admin-approved challenges can receive team applications.' });
  if (c.teamApplication?.status === 'pending') return res.status(409).json({ error: 'A team application is already pending for this challenge.' });
  if (c.teamApplication?.status === 'approved') return res.status(409).json({ error: 'This challenge already has an approved university team.' });
  c.teamApplication = { teamName, university: u.organization, contactName: u.name, contactEmail: u.email, appliedAt: new Date().toISOString(), status: 'pending' };
  const solutionTitle = cleanText(req.body?.solutionTitle), solutionDescription = cleanText(req.body?.solutionDescription);
  if (solutionTitle || solutionDescription) {
    if (solutionTitle.length < 8 || solutionDescription.length < 30) return res.status(400).json({ error: 'If you include a solution now, provide a title and at least 30 characters of detail.' });
    c.solution = { title: solutionTitle, description: solutionDescription, status: 'pending', submittedAt: new Date().toISOString(), submittedBy: u.name, submittedByEmail: u.email };
  }
  addTimeline(c, 'University team application submitted', u.name, `${teamName} from ${u.organization} is waiting for Admin approval.`);
  write(CHALLENGE_FILE, challenges);
  const requests = read(REQUEST_FILE); const request = { id: `r-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, type: 'team_application', status: 'pending', title: `University team application: ${teamName}`, message: `${u.name} from ${u.organization} applied to work on “${c.title}”.`, requesterName: u.name, requesterEmail: u.email, requesterRole: 'university', organization: u.organization, challengeId: c.id, createdAt: new Date().toISOString() };
  requests.unshift(request);
  if (c.solution) requests.unshift({ id: `r-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, type: 'solution_submission', status: 'pending', title: `Solution submitted: ${c.solution.title}`, message: `${u.organization} submitted a solution with its team application.`, requesterName: u.name, requesterEmail: u.email, requesterRole: 'university', organization: u.organization, challengeId: c.id, createdAt: new Date().toISOString() });
  write(REQUEST_FILE, requests);
  await notifyAdmin('approval-requested', { request, challenge: c, requester: { name: u.name, email: u.email, role: u.role, organization: u.organization } });
  broadcast('challenge-updated', { challenge: c }); res.status(201).json({ challenge: c, request });
});

app.post('/api/challenges/:id/solution', requireAuth, async (req, res) => {
  const u = req.user; if (u.role !== 'university') return res.status(403).json({ error: 'Only university teams can submit solutions.' });
  const title = cleanText(req.body?.title), description = cleanText(req.body?.description);
  if (title.length < 8 || description.length < 30) return res.status(400).json({ error: 'Add a solution title and at least 30 characters describing the approach.' });
  const cs = read(CHALLENGE_FILE), c = cs.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' });
  if (c.teamApplication?.status !== 'approved' || c.teamApplication?.contactEmail !== u.email) return res.status(403).json({ error: 'Only your Admin-approved team can submit a solution.' });
  if (c.solution?.status === 'approved') return res.status(409).json({ error: 'This solution is already approved.' });
  c.solution = { title, description, status: 'pending', submittedAt: new Date().toISOString(), submittedBy: u.name, submittedByEmail: u.email };
  addTimeline(c, 'University solution submitted', u.name, 'Solution is waiting for Admin review.', c.status); write(CHALLENGE_FILE, cs);
  const rs = read(REQUEST_FILE); const request = { id:`r-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, type:'solution_submission', status:'pending', title:`Solution submission: ${title}`, message:`${u.organization} submitted a solution for “${c.title}”.`, requesterName:u.name, requesterEmail:u.email, requesterRole:'university', organization:u.organization, challengeId:c.id, createdAt:new Date().toISOString() }; rs.unshift(request); write(REQUEST_FILE,rs);
  await notifyAdmin('approval-requested',{request,challenge:c,requester:{name:u.name,email:u.email,role:u.role,organization:u.organization}}); broadcast('challenge-updated',{challenge:c}); res.status(201).json({challenge:c,request});
});

app.post('/api/challenges/:id/support', requireAuth, (req, res) => {
  const cs = read(CHALLENGE_FILE), c = cs.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' });
  if (c.status === 'pending' || c.status === 'rejected') return res.status(409).json({ error: 'Only approved challenges can receive community support.' });
  c.supporters = Number(c.supporters || 0) + 1; addTimeline(c, 'Community support added', req.user.name, `This report now has ${c.supporters} supporters.`); write(CHALLENGE_FILE, cs); broadcast('challenge-updated', { challenge: c }); res.json(c);
});
app.post('/api/challenges/:id/progress', requireAuth, (req, res) => {
  const u = req.user; if (!['university','industry'].includes(u.role)) return res.status(403).json({ error: 'Only the assigned university team or accepted industry partner can post project updates.' });
  const note = cleanText(req.body?.note); if (note.length < 5) return res.status(400).json({ error: 'Add a short progress update.' });
  const cs = read(CHALLENGE_FILE), c = cs.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' });
  const universityCanPost = u.role==='university' && c.teamApplication?.status==='approved' && c.teamApplication?.contactEmail===u.email;
  const industryCanPost = u.role==='industry' && c.collaborationProposals?.some(p=>p.status==='accepted'&&p.contactEmail===u.email);
  if (!universityCanPost && !industryCanPost) return res.status(403).json({ error: 'Only the assigned university team or accepted industry partner can post updates.' });
  const nextStatus = c.status==='collaboration' ? 'collaboration' : 'progress'; c.status = nextStatus; addTimeline(c, u.role==='industry'?'Industry collaboration update':'University progress update', u.name, note, nextStatus); write(CHALLENGE_FILE, cs); broadcast('challenge-updated', { challenge: c }); res.json(c);
});
app.post('/api/challenges/:id/industry-interest', requireAuth, async (req, res) => {
  const u = req.user; if (u.role !== 'industry') return res.status(403).json({ error: 'Only industry partners can express interest.' });
  const cs = read(CHALLENGE_FILE), c = cs.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' });
  if (!['assigned', 'progress', 'collaboration', 'resolved'].includes(c.status)) return res.status(409).json({ error: 'This challenge is not yet open to industry collaboration.' });
  if (c.teamApplication?.status !== 'approved' || c.solution?.status !== 'approved') return res.status(409).json({ error: 'The university team and its solution must be Admin-approved before industry can connect.' });
  c.industryInterests = [...(c.industryInterests || [])]; if (c.industryInterests.some(x => x.contactEmail === u.email && ['pending','approved'].includes(x.status))) return res.status(409).json({ error: 'Your company already has an active or approved interest.' });
  const interest = { company: u.organization, contactName: u.name, contactEmail: u.email, status: 'pending', expressedAt: new Date().toISOString() }; c.industryInterests.push(interest); addTimeline(c, 'Industry interest submitted', u.name, `${u.organization} expressed interest and is waiting for Admin review.`); write(CHALLENGE_FILE, cs);
  const rs = read(REQUEST_FILE); const request = { id: `r-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, type: 'industry_interest', status: 'pending', title: `Industry interest: ${u.organization}`, message: `${u.organization} wants to support the university work on “${c.title}”.`, requesterName: u.name, requesterEmail: u.email, requesterRole: 'industry', organization: u.organization, challengeId: c.id, createdAt: new Date().toISOString() }; rs.unshift(request); write(REQUEST_FILE, rs);
  await notifyAdmin('approval-requested', { request, challenge: c, requester: { name: u.name, email: u.email, role: u.role, organization: u.organization } }); broadcast('challenge-updated', { challenge: c }); res.status(201).json({ challenge: c, request });
});
app.post('/api/challenges/:id/proposals', requireAuth, async (req, res) => {
  const u=req.user; if(u.role!=='industry') return res.status(403).json({error:'Only industry partners can send collaboration proposals.'});
  const idea=cleanText(req.body?.idea), offer=cleanText(req.body?.offer), bid=cleanText(req.body?.bid);
  if(idea.length<20) return res.status(400).json({error:'Describe your proposed idea or contribution in at least 20 characters.'});
  const cs=read(CHALLENGE_FILE), c=cs.find(x=>x.id===req.params.id); if(!c)return res.status(404).json({error:'Challenge not found.'});
  if(c.teamApplication?.status!=='approved'||c.solution?.status!=='approved')return res.status(409).json({error:'Only challenges with an approved university team and solution can receive proposals.'});
  const proposals=c.collaborationProposals||[]; if(proposals.some(x=>x.contactEmail===u.email&&x.status==='pending'))return res.status(409).json({error:'You already have a proposal pending for this team.'});
  const proposal={id:`p-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,company:u.organization,contactName:u.name,contactEmail:u.email,idea,offer:offer||undefined,bid:bid||undefined,status:'pending',createdAt:new Date().toISOString()};
  c.collaborationProposals=[proposal,...proposals]; addTimeline(c,'Industry collaboration proposal received',u.name,`${u.organization} proposed a collaboration for the university solution.`,c.status); write(CHALLENGE_FILE,cs); broadcast('challenge-updated',{challenge:c}); res.status(201).json(c);
});
app.post('/api/challenges/:id/proposals/:proposalId/respond', requireAuth, (req,res)=>{
  const u=req.user, decision=req.body?.decision==='accept'?'accept':'reject', note=cleanText(req.body?.note); if(u.role!=='university')return res.status(403).json({error:'Only the university team can respond to proposals.'});
  const cs=read(CHALLENGE_FILE), c=cs.find(x=>x.id===req.params.id); if(!c)return res.status(404).json({error:'Challenge not found.'}); if(c.teamApplication?.status!=='approved'||c.teamApplication?.contactEmail!==u.email)return res.status(403).json({error:'Only the assigned university team can respond.'});
  const proposal=c.collaborationProposals?.find(x=>x.id===req.params.proposalId); if(!proposal)return res.status(404).json({error:'Proposal not found.'}); if(proposal.status!=='pending')return res.status(409).json({error:'This proposal has already been answered.'});
  proposal.status=decision==='accept'?'accepted':'rejected'; proposal.respondedAt=new Date().toISOString(); proposal.responseNote=note||undefined;
  if(decision==='accept'){c.status='collaboration'; c.assignedTo=c.teamApplication?.university; for(const other of (c.collaborationProposals||[])){if(other.id!==proposal.id&&other.status==='pending'){other.status='rejected';other.respondedAt=new Date().toISOString();other.responseNote='Another collaboration proposal was accepted.';}}}
  addTimeline(c,decision==='accept'?'University accepted industry collaboration':'University rejected industry collaboration',u.name,note||`${proposal.company} was ${decision}ed.`,c.status); write(CHALLENGE_FILE,cs); broadcast('challenge-updated',{challenge:c}); res.json(c);
});
app.post('/api/challenges/:id/completion', requireAuth, async (req,res)=>{
  const u=req.user; if(u.role!=='industry')return res.status(403).json({error:'Only the accepted industry partner can submit completion.'});
  const summary=cleanText(req.body?.summary); const proofs=Array.isArray(req.body?.proofs)?req.body.proofs.map(cleanText).filter(Boolean):[];
  if(summary.length<30||proofs.length<1)return res.status(400).json({error:'Add a completion summary and at least one proof link.'});
  const cs=read(CHALLENGE_FILE), c=cs.find(x=>x.id===req.params.id); if(!c)return res.status(404).json({error:'Challenge not found.'});
  const accepted=c.collaborationProposals?.find(x=>x.status==='accepted'&&x.contactEmail===u.email); if(!accepted)return res.status(403).json({error:'Only the accepted industry partner can submit completion.'});
  c.completionSubmission={status:'pending',submittedAt:new Date().toISOString(),submittedBy:u.name,submittedByEmail:u.email,summary,proofs}; addTimeline(c,'Industry submitted completion proof',u.name,'Work is complete and waiting for final Admin verification.',c.status); write(CHALLENGE_FILE,cs);
  const rs=read(REQUEST_FILE); const request={id:`r-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,type:'completion',status:'pending',title:`Completion proof: ${c.title}`,message:`${u.organization} says the collaborative work is complete and submitted proof for final Admin verification.`,requesterName:u.name,requesterEmail:u.email,requesterRole:'industry',organization:u.organization,challengeId:c.id,createdAt:new Date().toISOString()}; rs.unshift(request); write(REQUEST_FILE,rs); await notifyAdmin('approval-requested',{request,challenge:c,requester:{name:u.name,email:u.email,role:u.role,organization:u.organization}}); broadcast('challenge-updated',{challenge:c}); res.status(201).json({challenge:c,request});
});

app.post('/api/challenges/:id/verify-request', requireAuth, async (req, res) => {
  const u = req.user; if (!['university', 'industry'].includes(u.role)) return res.status(403).json({ error: 'Only university or industry users can send approval requests.' });
  const challenges = read(CHALLENGE_FILE), c = challenges.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' });
  if (c.verificationRequested) return res.status(409).json({ error: 'An Admin approval request is already pending.' });
  c.verificationRequested = true; c.verificationStatus = 'pending'; c.verificationRequestedBy = u.id; c.verificationRequestedByName = u.name; c.verificationRequestedByEmail = u.email; c.verificationRequestedAt = new Date().toISOString(); addTimeline(c, 'Approval request sent to Admin', u.name, `${u.name} (${u.email}) requested Admin review.`); write(CHALLENGE_FILE, challenges);
  const requests = read(REQUEST_FILE); const request = { id: `r-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, type: 'verification', status: 'pending', title: `Approval request: ${c.title}`, message: `${u.name} from ${u.organization || u.role} requested Admin verification.`, requesterName: u.name, requesterEmail: u.email, requesterRole: u.role, organization: u.organization, challengeId: c.id, createdAt: new Date().toISOString() }; requests.unshift(request); write(REQUEST_FILE, requests);
  await notifyAdmin('approval-requested', { request, challenge: c, requester: { name: u.name, email: u.email, role: u.role, organization: u.organization } }); broadcast('challenge-updated', { challenge: c }); res.status(201).json({ request, challenge: c });
});

// ---------- Admin ----------
app.get('/api/approval-requests', requireAdmin, (_req, res) => res.json(read(REQUEST_FILE)));
function applyRequestDecision(request, approved, admin) {
  request.status = approved ? 'approved' : 'rejected'; request.reviewedAt = new Date().toISOString(); request.reviewedBy = admin.email;
  if (!request.challengeId) return null;
  const cs = read(CHALLENGE_FILE), c = cs.find(x => x.id === request.challengeId); if (!c) return null;
  if (request.type === 'challenge') c.status = approved ? 'review' : 'rejected';
  if (request.type === 'team_application') { if (c.teamApplication) c.teamApplication.status = approved ? 'approved' : 'rejected'; if (approved) { c.status = 'assigned'; c.assignedTo = c.teamApplication?.university; c.assignedAt = new Date().toISOString(); } }
  if (request.type === 'industry_interest') { const interest = c.industryInterests?.find(x => x.contactEmail === request.requesterEmail && (x.status === 'pending' || x.status === 'rejected')); if (interest) { interest.status = approved ? 'approved' : 'rejected'; interest.reviewedAt = new Date().toISOString(); interest.reviewedBy = admin.email; } }
  if (request.type === 'solution_submission') { if (c.solution) { c.solution.status = approved ? 'approved' : 'rejected'; c.solution.reviewedAt = new Date().toISOString(); c.solution.reviewedBy = admin.email; if (!approved) c.status = 'assigned'; } }
  if (request.type === 'completion') { if (c.completionSubmission) { c.completionSubmission.status = approved ? 'approved' : 'rejected'; c.completionSubmission.reviewedAt = new Date().toISOString(); c.completionSubmission.reviewedBy = admin.email; c.completionSubmission.reviewNote = approved ? 'Final completion verified by the sole Samadhan Admin.' : 'Completion proof needs more work.'; } if (approved) c.status = 'resolved'; }
  if (request.type === 'verification') { c.verificationRequested = false; c.verificationStatus = approved ? 'approved' : 'rejected'; }
  addTimeline(c, approved ? 'Approved by Admin' : 'Rejected by Admin', admin.name, approved ? 'The sole Samadhan Admin approved this request.' : 'The sole Samadhan Admin rejected this request.', c.status); write(CHALLENGE_FILE, cs); broadcast('challenge-updated', { challenge: c }); return c;
}
app.post('/api/admin/approval-requests/:id/approve', requireAdmin, (req, res) => { const rs = read(REQUEST_FILE), r = rs.find(x => x.id === req.params.id); if (!r) return res.status(404).json({ error: 'Request not found.' }); if (r.status !== 'pending') return res.status(409).json({ error: 'This request has already been reviewed.' }); const c = applyRequestDecision(r, true, req.user); write(REQUEST_FILE, rs); broadcast('approval-reviewed', { request: r }); res.json({ request: r, challenge: c }); });
app.post('/api/admin/approval-requests/:id/reject', requireAdmin, (req, res) => { const rs = read(REQUEST_FILE), r = rs.find(x => x.id === req.params.id); if (!r) return res.status(404).json({ error: 'Request not found.' }); if (r.status !== 'pending') return res.status(409).json({ error: 'This request has already been reviewed.' }); const c = applyRequestDecision(r, false, req.user); write(REQUEST_FILE, rs); broadcast('approval-reviewed', { request: r }); res.json({ request: r, challenge: c }); });
app.post('/api/admin/challenges/:id/approve', requireAdmin, (req, res) => { const cs = read(CHALLENGE_FILE), c = cs.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' }); c.status = 'review'; addTimeline(c, 'Approved by Admin', req.user.name, 'The sole Samadhan Admin approved this submission.', 'review'); write(CHALLENGE_FILE, cs); const rs = read(REQUEST_FILE); rs.filter(r=>r.challengeId===c.id&&r.status==='pending').forEach(r=>{r.status='approved';r.reviewedAt=new Date().toISOString();r.reviewedBy=req.user.email}); write(REQUEST_FILE,rs); broadcast('challenge-updated',{challenge:c}); res.json(c); });
app.post('/api/admin/challenges/:id/reject', requireAdmin, (req, res) => { const cs = read(CHALLENGE_FILE), c = cs.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Challenge not found.' }); c.status = 'rejected'; c.rejectionReason = cleanText(req.body?.reason) || 'Rejected by Admin'; addTimeline(c, 'Rejected by Admin', req.user.name, c.rejectionReason, 'rejected'); write(CHALLENGE_FILE, cs); const rs = read(REQUEST_FILE); rs.filter(r=>r.challengeId===c.id&&r.status==='pending').forEach(r=>{r.status='rejected';r.reviewedAt=new Date().toISOString();r.reviewedBy=req.user.email}); write(REQUEST_FILE,rs); broadcast('challenge-updated',{challenge:c}); res.json(c); });

// ---------- Location ----------
app.get('/api/geocode', async (req, res) => { const lat=Number(req.query.lat), lon=Number(req.query.lon); if(!Number.isFinite(lat)||!Number.isFinite(lon))return res.status(400).json({error:'Valid coordinates required.'}); try { const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`,{headers:{'User-Agent':'SamadhanPlatform/2.0'}}); if(!r.ok)throw new Error(); res.json(await r.json()); } catch { res.status(502).json({error:'Could not resolve this location right now.'}); } });

const dist = path.join(__dirname, 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) { console.log('Frontend build not found. Building with Vite…'); await build({ root: __dirname }); }
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`Samadhan server running on port ${PORT}`));
