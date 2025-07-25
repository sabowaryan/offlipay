const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.offlipay.app.dev';
  if (IS_PREVIEW) return 'com.offlipay.app.preview';
  return 'com.offlipay.app';
};

const getAppName = () => {
  if (IS_DEV) return 'OffliPay (Dev)';
  if (IS_PREVIEW) return 'OffliPay (Preview)';
  return 'OffliPay';
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  slug: 'offlipay',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/AppIcons/1024.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    icon: './assets/images/AppIcons/Assets.xcassets/AppIcon.appiconset/1024.png',
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
    adaptiveIcon: {
      foregroundImage: './assets/images/AppIcons/android/mipmap-xxxhdpi/ic_launcher.png',
      backgroundColor: '#000000',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/AppIcons/Assets.xcassets/AppIcon.appiconset/1024.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-secure-store',
    'expo-font',
    'expo-web-browser',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'offlipay',
        organization: 'stelm-technologies',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    'expo-router': {
      appRoot: 'app',
    },
    router: {},
    eas: {
      projectId: 'd7a567cd-c15d-4ee3-aa03-81fb41fb21a9',
    },
  },
  owner: 'albatros01',
});
