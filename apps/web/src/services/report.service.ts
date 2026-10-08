import { apiFetch } from '../lib/api';

export interface UserReport {
  id: string;
  cafeId: string;
  reporterId: string;
  discountId: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason: string | null;
  createdAt: string;
}

export function getMyReports(token: string) {
  return apiFetch<UserReport[]>('/reports', { token });
}

export function createReport(
  token: string,
  body: { cafeId: string; content: string; discountId?: string },
) {
  return apiFetch<UserReport>('/reports', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}
