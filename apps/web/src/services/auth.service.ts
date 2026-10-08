import type { Profile } from '@masyl/types';
import { apiFetch } from '../lib/api';

export function getMe(token: string) {
  return apiFetch<Profile>('/auth/me', { token });
}

export function becomeSeller(token: string) {
  return apiFetch<Profile>('/auth/seller', { method: 'POST', token });
}
