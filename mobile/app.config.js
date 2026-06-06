module.exports = {
  expo: {
    name: 'Mobile Token',
    slug: 'mobile-token-poc',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    android: {
      package: 'com.mobiletoken.poc',
      // On EAS Build the secret is injected as a file path via env var.
      // Locally it falls back to the file in the project root.
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundColor: '#2563eb',
      },
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#2563eb',
          sounds: [],
        },
      ],
    ],
    scheme: 'mobiletoken',
    extra: {
      eas: {
        projectId: '1a044f9a-6e2d-473f-a8c7-906321283462',
      },
    },
  },
};
