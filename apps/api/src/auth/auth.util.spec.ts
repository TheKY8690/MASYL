import { WEB_LOGIN_PROVIDERS } from '@masyl/types';
import {
  canRegisterCafe,
  canSellerRegisterDiscount,
  isSupportedProvider,
  nextRoleAfterBecomeSeller,
} from './auth.util';

describe('auth.util', () => {
  it('web user login is google only', () => {
    expect([...WEB_LOGIN_PROVIDERS]).toEqual(['google']);
    expect(WEB_LOGIN_PROVIDERS.includes('kakao' as never)).toBe(false);
    expect(WEB_LOGIN_PROVIDERS.includes('toss' as never)).toBe(false);
  });

  it('accepts google, kakao, toss', () => {
    expect(isSupportedProvider('google')).toBe(true);
    expect(isSupportedProvider('kakao')).toBe(true);
    expect(isSupportedProvider('toss')).toBe(true);
  });

  it('rejects unknown providers', () => {
    expect(isSupportedProvider('naver')).toBe(false);
    expect(isSupportedProvider(undefined)).toBe(false);
  });

  it('cafe register allowed for seller and admin only', () => {
    expect(canRegisterCafe('user')).toBe(false);
    expect(canRegisterCafe('seller')).toBe(true);
    expect(canRegisterCafe('admin')).toBe(true);
  });

  it('become-seller promotes user, keeps admin', () => {
    expect(nextRoleAfterBecomeSeller('user')).toBe('seller');
    expect(nextRoleAfterBecomeSeller('seller')).toBe('seller');
    expect(nextRoleAfterBecomeSeller('admin')).toBe('admin');
  });

  it('seller discount only on owned cafe', () => {
    const owner = 'owner-1';
    expect(canSellerRegisterDiscount('admin', 'other', owner)).toBe(true);
    expect(canSellerRegisterDiscount('seller', owner, owner)).toBe(true);
    expect(canSellerRegisterDiscount('seller', 'other', owner)).toBe(false);
    expect(canSellerRegisterDiscount('user', owner, owner)).toBe(false);
  });
});
