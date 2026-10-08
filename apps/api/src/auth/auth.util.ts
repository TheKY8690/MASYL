export const SUPPORTED_PROVIDERS = ['google', 'kakao', 'toss'] as const;
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export function isSupportedProvider(
  provider: string | undefined,
): provider is SupportedProvider {
  return (
    provider !== undefined &&
    (SUPPORTED_PROVIDERS as readonly string[]).includes(provider)
  );
}

export function canRegisterCafe(role: string | undefined): boolean {
  return role === 'seller' || role === 'admin';
}

export function nextRoleAfterBecomeSeller(
  role: string | undefined,
): 'seller' | 'admin' {
  return role === 'admin' ? 'admin' : 'seller';
}

export function canSellerRegisterDiscount(
  role: string | undefined,
  cafeOwnerId: string | null | undefined,
  userId: string,
): boolean {
  if (role === 'admin') return true;
  if (role === 'seller') return cafeOwnerId === userId;
  return false;
}
