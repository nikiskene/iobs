import type { ExpeditionInquiry } from '../../../lib/types';

export const inquiryStatuses: {
  value: ExpeditionInquiry['status'];
  label: string;
}[] = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'interesting', label: 'Interesting' },
  { value: 'interview', label: 'Interview' },
  { value: 'invited', label: 'Invited' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'waiting_list', label: 'Waiting List' },
  { value: 'declined', label: 'Declined' },
  { value: 'attended', label: 'Attended' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'archived', label: 'Archived' },
];