export type Role = 'citizen' | 'university' | 'industry' | 'admin';
export type ChallengeStatus = 'pending' | 'review' | 'assigned' | 'progress' | 'collaboration' | 'resolved' | 'rejected';

export interface User { id:string; name:string; email:string; role:Role; organization?:string; state?:string; district?:string; }
export interface TimelineEntry { id:string; label:string; actor:string; date:string; note?:string; status:ChallengeStatus; }

export interface SolutionSubmission {
  title:string; description:string; status:'pending'|'approved'|'rejected';
  submittedAt:string; submittedBy:string; submittedByEmail:string; reviewedAt?:string; reviewedBy?:string;
}
export interface CollaborationProposal {
  id:string; company:string; contactName:string; contactEmail:string; idea:string; offer?:string; bid?:string;
  status:'pending'|'accepted'|'rejected'; createdAt:string; respondedAt?:string; responseNote?:string;
}
export interface CompletionSubmission {
  status:'pending'|'approved'|'rejected'; submittedAt:string; submittedBy:string; submittedByEmail:string;
  summary:string; proofs:string[]; reviewedAt?:string; reviewedBy?:string; reviewNote?:string;
}

export interface Challenge {
  id:string; reference:string; title:string; description:string; domain:string; status:ChallengeStatus; country:string;
  state:string; district:string; city:string; pincode:string; latitude?:number; longitude?:number; locationAccuracy?:number;
  submittedBy:string; submittedByEmail?:string; submittedByRole?:Role; submittedAt:string; supporters:number; duplicatesMerged:number;
  assignedTo?:string; assignedBy?:string; assignedAt?:string;
  industryInterests?:Array<{company:string;contactName:string;contactEmail:string;status:'pending'|'approved'|'rejected';expressedAt:string}>;
  teamApplication?:{teamName:string;university:string;contactName:string;contactEmail:string;appliedAt:string;status:'pending'|'approved'|'rejected'};
  solution?:SolutionSubmission;
  collaborationProposals?:CollaborationProposal[];
  completionSubmission?:CompletionSubmission;
  mediaUrl?:string; timeline:TimelineEntry[];
  verificationRequested?:boolean; verificationStatus?:'pending'|'approved'|'rejected';
  verificationRequestedBy?:string; verificationRequestedByName?:string; verificationRequestedByEmail?:string; verificationRequestedAt?:string;
}

export interface ApprovalRequest {
  id:string; type:'challenge'|'verification'|'institution'|'team_application'|'industry_interest'|'solution_submission'|'completion';
  status:'pending'|'approved'|'rejected'; title:string; message:string; requesterName:string; requesterEmail:string;
  requesterRole:Role; organization?:string; challengeId?:string; createdAt:string; reviewedAt?:string; reviewedBy?:string;
}
