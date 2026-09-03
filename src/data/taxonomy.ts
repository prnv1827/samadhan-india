import type { ChallengeStatus, Role } from '../types';

export const domains = [
  'Water & Sanitation','Roads & Transport','Waste Management','Electricity & Energy',
  'Healthcare Access','Education','Agriculture & Irrigation','Forest & Environment',
  'Livelihood & Skills','Digital Access','Public Safety','Housing & Accessibility','Other'
] as const;

export const states = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
] as const;

export const statusMeta: Record<ChallengeStatus,{label:string;dot:string;chip:string;text:string}> = {
  pending:{label:'Pending Approval',dot:'bg-status-pending',chip:'bg-[#FDF3DC] border-[#EBD9A8]',text:'text-status-pending'},
  review:{label:'Approved · Under Review',dot:'bg-status-review',chip:'bg-[#E7EEFA] border-[#C2D3EE]',text:'text-status-review'},
  assigned:{label:'Assigned to University',dot:'bg-status-assigned',chip:'bg-[#EEE9F8] border-[#D5C9EE]',text:'text-status-assigned'},
  progress:{label:'In Progress',dot:'bg-status-progress',chip:'bg-[#E1F0EE] border-[#B9DCD7]',text:'text-status-progress'},
  collaboration:{label:'Industry + University Collaboration',dot:'bg-status-progress',chip:'bg-[#E1F0EE] border-[#B9DCD7]',text:'text-status-progress'},
  resolved:{label:'Resolved',dot:'bg-status-resolved',chip:'bg-[#E4F2E7] border-[#BEDFC6]',text:'text-status-resolved'},
  rejected:{label:'Rejected by Admin',dot:'bg-clay-500',chip:'bg-clay-50 border-clay-100',text:'text-clay-600'}
};
export const statusOrder: ChallengeStatus[] = ['pending','review','assigned','progress','collaboration','resolved','rejected'];
export const roleMeta: Record<Role,{label:string;blurb:string;home:string}> = {
  citizen:{label:'Citizen',blurb:'Report problems you see anywhere in India and follow them through resolution.',home:'/citizen/submit'},
  university:{label:'University',blurb:'Find approved challenges and apply student or faculty teams to solve them.',home:'/university'},
  industry:{label:'Industry Partner',blurb:'Discover approved challenges and university-led teams worth backing.',home:'/industry'},
  admin:{label:'Platform Admin',blurb:'The sole administrator: approve, reject, route and monitor every request.',home:'/admin'}
};
