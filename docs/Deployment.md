# Guide de Déploiement - OffliPay

## 📋 Vue d'ensemble

Ce guide couvre le processus de déploiement d'OffliPay sur les différentes plateformes (iOS, Android, Web) en utilisant EAS Build et les meilleures pratiques de déploiement.

## 🏗️ Configuration EAS

### Installation et configuration initiale

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Initialiser EAS dans le projet
eas build:configure
```

### Configuration eas.json

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "development"
      },
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "preview"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "env": {
        "APP_VARIANT": "production"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

## 📱 Déploiement Android

### Configuration Android

#### 1. Keystore de production

```bash
# Générer un keystore de production
keytool -genkey -v -keystore offlipay-release-key.keystore -alias offlipay -keyalg RSA -keysize 2048 -validity 10000

# Stocker le keystore de manière sécurisée
# Ne jamais commiter le keystore dans le repository
```

#### 2. Configuration app.config.js pour Android

```javascript
export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: "com.offlipay.app",
    versionCode: 1,
    compileSdkVersion: 33,
    targetSdkVersion: 33,
    buildToolsVersion: "33.0.0",
    keystorePath: process.env.ANDROID_KEYSTORE_PATH,
    keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
    keyAlias: process.env.ANDROID_KEY_ALIAS,
    keyPassword: process.env.ANDROID_KEY_PASSWORD,
    permissions: [
      "CAMERA",
      "WRITE_EXTERNAL_STORAGE",
      "READ_EXTERNAL_STORAGE",
      "INTERNET",
      "ACCESS_NETWORK_STATE"
    ]
  }
});
```

#### 3. Variables d'environnement pour Android

```bash
# .env.production
ANDROID_KEYSTORE_PATH=./offlipay-release-key.keystore
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=offlipay
ANDROID_KEY_PASSWORD=your_key_password
```

### Builds Android

```bash
# Build de développement (APK debug)
eas build --platform android --profile development

# Build de preview (APK release)
eas build --platform android --profile preview

# Build de production (AAB pour Play Store)
eas build --platform android --profile production

# Build local (si configuré)
eas build --platform android --local
```

### Déploiement sur Google Play Store

#### 1. Configuration du compte de service

```bash
# Créer un compte de service Google Cloud
# Télécharger le fichier JSON de clés
# Le placer dans le projet (ne pas commiter)
```

#### 2. Soumission automatique

```bash
# Soumettre à la piste interne
eas submit --platform android --profile production

# Ou manuellement spécifier le fichier
eas submit --platform android --path ./build.aab
```

#### 3. Configuration des métadonnées

```json
// store-config/android/metadata.json
{
  "title": "OffliPay - Paiement Mobile",
  "shortDescription": "Application de paiement mobile hors ligne",
  "fullDescription": "OffliPay permet d'effectuer des paiements mobiles sécurisés même sans connexion internet...",
  "keywords": ["paiement", "mobile", "hors ligne", "QR code", "portefeuille"],
  "category": "FINANCE",
  "contentRating": "EVERYONE",
  "contactEmail": "support@offlipay.com",
  "contactPhone": "+221123456789",
  "contactWebsite": "https://offlipay.com"
}
```

## 🍎 Déploiement iOS

### Configuration iOS

#### 1. Certificats et profils de provisioning

```bash
# Configurer automatiquement avec EAS
eas credentials

# Ou gérer manuellement via Apple Developer Portal
# - Certificat de distribution
# - Profil de provisioning de distribution
# - Push notification certificate (si nécessaire)
```

#### 2. Configuration app.config.js pour iOS

```javascript
export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier: "com.offlipay.app",
    buildNumber: "1",
    supportsTablet: true,
    requireFullScreen: false,
    userInterfaceStyle: "automatic",
    infoPlist: {
      NSCameraUsageDescription: "L'application utilise la caméra pour scanner les QR codes",
      NSPhotoLibraryUsageDescription: "L'application peut accéder aux photos pour partager des QR codes",
      CFBundleAllowMixedLocalizations: true,
      ITSAppUsesNonExemptEncryption: false
    },
    associatedDomains: ["applinks:offlipay.com"],
    entitlements: {
      "keychain-access-groups": ["$(AppIdentifierPrefix)com.offlipay.app"]
    }
  }
});
```

### Builds iOS

```bash
# Build de développement
eas build --platform ios --profile development

# Build de preview (TestFlight interne)
eas build --platform ios --profile preview

# Build de production (App Store)
eas build --platform ios --profile production
```

### Déploiement sur App Store

#### 1. Configuration App Store Connect

```bash
# Créer l'application dans App Store Connect
# Configurer les métadonnées
# Préparer les captures d'écran
```

#### 2. Soumission automatique

```bash
# Soumettre à TestFlight
eas submit --platform ios --profile production

# Ou avec un fichier IPA spécifique
eas submit --platform ios --path ./build.ipa
```

#### 3. Métadonnées App Store

```json
// store-config/ios/metadata.json
{
  "name": "OffliPay",
  "subtitle": "Paiement Mobile Hors Ligne",
  "description": "OffliPay révolutionne les paiements mobiles...",
  "keywords": "paiement,mobile,hors ligne,QR code,portefeuille,sécurisé",
  "supportURL": "https://offlipay.com/support",
  "marketingURL": "https://offlipay.com",
  "privacyPolicyURL": "https://offlipay.com/privacy",
  "category": "FINANCE",
  "contentRating": "4+"
}
```

## 🌐 Déploiement Web

### Configuration Web

#### 1. Build de production web

```bash
# Build web avec Expo
npx expo export:web

# Ou avec script npm
npm run build:web
```

#### 2. Configuration pour le web

```javascript
// app.config.js
export default ({ config }) => ({
  ...config,
  web: {
    ...config.web,
    favicon: "./assets/favicon.png",
    bundler: "metro",
    output: "static",
    lang: "fr"
  }
});
```

### Déploiement sur Vercel

#### 1. Configuration vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "EXPO_PUBLIC_API_URL": "@api-url-production"
  }
}
```

#### 2. Scripts de déploiement

```json
// package.json
{
  "scripts": {
    "build:web": "expo export:web",
    "deploy:web": "vercel --prod",
    "preview:web": "vercel"
  }
}
```

#### 3. Déploiement automatique

```bash
# Déploiement de preview
vercel

# Déploiement de production
vercel --prod

# Avec variables d'environnement
vercel --prod --env EXPO_PUBLIC_API_URL=https://api.offlipay.com
```

### Déploiement sur Netlify

#### 1. Configuration netlify.toml

```toml
[build]
  command = "npm run build:web"
  publish = "dist"

[build.environment]
  EXPO_PUBLIC_API_URL = "https://api.offlipay.com"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🔄 CI/CD avec GitHub Actions

### Workflow de build automatique

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage --watchAll=false
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}

  build-ios:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npm run build:web
        env:
          EXPO_PUBLIC_API_URL: ${{ secrets.API_URL_PRODUCTION }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Workflow de release automatique

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
      
      - name: Build and Submit to Stores
        run: |
          eas build --platform all --profile production --non-interactive
          eas submit --platform all --profile production --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 🔐 Gestion des secrets

### Variables d'environnement de production

```bash
# Secrets GitHub Actions
EXPO_TOKEN=your_expo_token
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_PASSWORD=your_key_password
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
API_URL_PRODUCTION=https://api.offlipay.com
SENTRY_DSN=your_sentry_dsn
```

### Gestion des certificats iOS

```bash
# Stocker les certificats de manière sécurisée
eas credentials

# Ou utiliser des secrets GitHub pour les certificats
# APPLE_CERT_P12_BASE64
# APPLE_CERT_PASSWORD
# APPLE_PROVISIONING_PROFILE_BASE64
```

## 📊 Monitoring et analytics

### Configuration Sentry

```javascript
// app.config.js
export default ({ config }) => ({
  ...config,
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "offlipay",
          project: "offlipay-mobile",
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      },
    ],
  },
});
```

### Analytics de déploiement

```bash
# Tracker les déploiements avec Sentry
npx sentry-cli releases new $VERSION
npx sentry-cli releases set-commits $VERSION --auto
npx sentry-cli releases finalize $VERSION
```

## 🚀 Stratégies de déploiement

### Déploiement Blue-Green

```bash
# Déployer sur un environnement de staging
eas build --profile preview

# Tester l'environnement de staging
npm run test:e2e:staging

# Promouvoir vers la production
eas submit --profile production
```

### Déploiement par phases

```bash
# Phase 1: Déploiement interne (5% des utilisateurs)
eas submit --platform android --track internal

# Phase 2: Test fermé (20% des utilisateurs)
eas submit --platform android --track alpha

# Phase 3: Test ouvert (50% des utilisateurs)
eas submit --platform android --track beta

# Phase 4: Production complète
eas submit --platform android --track production
```

### Rollback automatique

```yaml
# Workflow de rollback
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback to version
        run: |
          # Logique de rollback
          echo "Rolling back to version ${{ github.event.inputs.version }}"
```

## 📋 Checklist de déploiement

### Pré-déploiement

- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Code review approuvé
- [ ] Variables d'environnement configurées
- [ ] Certificats et keystores valides
- [ ] Version incrémentée
- [ ] Changelog mis à jour

### Post-déploiement

- [ ] Build réussi sur toutes les plateformes
- [ ] Application testée sur les stores
- [ ] Monitoring actif
- [ ] Métriques de performance normales
- [ ] Pas d'erreurs critiques reportées
- [ ] Documentation mise à jour
- [ ] Équipe notifiée

### Rollback si nécessaire

- [ ] Identifier la cause du problème
- [ ] Décider du rollback ou du hotfix
- [ ] Exécuter le rollback
- [ ] Vérifier le retour à la normale
- [ ] Analyser et documenter l'incident

Ce guide de déploiement garantit un processus de mise en production robuste et automatisé pour OffliPay sur toutes les plateformes.