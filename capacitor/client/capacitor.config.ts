import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.announcing.client',
  appName: 'Announcing♪',
  webDir: '../../dist/client/cap',
  bundledWebRuntime: false,
  loggingBehavior: 'production',
  includePlugins: [
    '@capacitor-community/http',
    '@capacitor/app',
    '@capacitor/local-notifications',
    '@capacitor/push-notifications',
    '@capacitor/share',
    '@capacitor/storage',
  ],
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#000000',
    },
  },
};

export default config;
