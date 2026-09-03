# Samadhan — India-wide Realtime Collaboration Platform

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

Admin login:
- Email: admin@samadhan.local
- Password: admin123

## Workflow

1. Citizen submits a problem -> Pending Admin Approval.
2. Admin approves -> problem becomes Open/Under Review.
3. University applies a team, with an optional solution now or later -> Team Application Pending.
4. Admin approves the team -> Assigned to University.
5. University can submit a solution later -> Solution Pending Admin Review.
6. Admin approves the solution -> Industry can see the approved solution.
7. Industry sends a collaboration proposal with idea, offer and optional bid -> University receives it live.
8. University accepts/rejects the proposal. Accepting starts the collaboration.
9. University and accepted Industry partner can post realtime progress updates.
10. Industry submits completion summary + proof links -> Pending Final Admin Verification.
11. Admin verifies completion -> Problem becomes RESOLVED.

All request and approval changes are protected by server-side role checks. Realtime updates use Server-Sent Events. Data is stored in `data/*.json` for local/demo deployment; use PostgreSQL/Supabase for durable production persistence on Render.
