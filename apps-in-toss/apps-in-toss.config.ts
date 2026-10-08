import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'masyl',
  brand: {
    primaryColor: '#C8A84B',
  },
  webView: {},
  permissions: [
    {
      name: 'geolocation',
      access: 'access',
    },
  ],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  webBundleDir: 'dist',
});
