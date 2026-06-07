const isAndroidProduction = process.env.NODE_ENV === 'production' && process.env.CAP_ANDROID === 'true';

const config: any = {
  appId: 'com.deenify.app',
  appName: 'Deenify',
  webDir: isAndroidProduction ? 'out' : 'public',
  server: isAndroidProduction ? {
    androidScheme: 'https',
    url: undefined,
  } : {
    url: 'http://localhost:9002',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
    },
  },
};

export default config;
