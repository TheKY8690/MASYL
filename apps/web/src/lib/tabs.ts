export type AppTab = 'home' | 'map' | 'benefits' | 'my';

export function parseAppTab(value: string | null): AppTab {
  if (value === 'map' || value === 'benefits' || value === 'my') {
    return value;
  }
  return 'home';
}

export function tabHref(tab: AppTab): string {
  return tab === 'home' ? '/' : `/?tab=${tab}`;
}
