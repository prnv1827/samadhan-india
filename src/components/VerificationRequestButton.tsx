import {useState} from 'react';
import {Button} from './ui/Button';
import {useChallenges} from '../contexts/ChallengeContext';

export function VerificationRequestButton({challengeId,pending=false,status,className=''}:{challengeId:string;pending?:boolean;status?:'pending'|'approved'|'rejected';className?:string}){
  const{requestVerification}=useChallenges();
  const[sending,setSending]=useState(false);
  const[error,setError]=useState('');
  const current=status||(pending?'pending':undefined);
  async function click(){setSending(true);setError('');try{await requestVerification(challengeId);}catch(e){setError(e instanceof Error?e.message:'Could not send request');}finally{setSending(false);}}
  if(current==='pending')return <span className={`inline-flex items-center rounded-full border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-soft ${className}`}>⏳ Pending Admin approval</span>;
  if(current==='approved')return <span className={`inline-flex items-center rounded-full border border-status-resolved/30 bg-status-resolved/10 px-3 py-2 text-xs font-semibold text-status-resolved ${className}`}>✓ Admin approved</span>;
  if(current==='rejected')return <div className={className}><Button variant="ghost" size="sm" onClick={click} disabled={sending}>{sending?'Sending…':'Resubmit for Admin approval'}</Button>{error&&<p className="mt-1 text-xs text-clay-600">{error}</p>}</div>;
  return <div className={className}><Button variant="ghost" size="sm" onClick={click} disabled={sending}>{sending?'Sending…':'Send for Admin approval'}</Button>{error&&<p className="mt-1 text-xs text-clay-600">{error}</p>}</div>;
}
