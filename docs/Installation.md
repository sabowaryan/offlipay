# Guide d'Installation - OffliPay

## 📋 Prérequis

### Système requis
- **Node.js** : Version 18.0.0 ou supérieure
- **npm** : Version 8.0.0 ou supérieure (ou yarn 1.22+)
- **Git** : Pour cloner le repository
- **Expo CLI** : Pour le développement React Native

### Environnements de développement

#### Pour Android
- **Android Studio** : Version Arctic Fox ou supérieure
- **Android SDK** : API Level 33 (Android 13) minimum
- **Java Development Kit (JDK)** : Version 11 ou supérieure

#### Pour iOS (macOS uniquement)
- **Xcode** : Version 14.0 ou supérieure
- **iOS Simulator** : Inclus avec Xcode
- **CocoaPods** : Installé automatiquement avec Expo

#### Pour Web
- **Navigateur moderne** : Chrome, Firefox, Safari, Edge

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/sabowaryan/offlipay.git
cd offlipay
```

### 2. Installer les dépendances
```bash
# Avec npm
npm install

# Ou avec yarn
yarn install
```

### 3. Configuration des variables d'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos configurations
nano .env
```

#### Variables d'environnement requises
```env
# Configuration de base
APP_VARIANT=development
EXPO_PUBLIC_API_URL=https://api.offlipay.com
EXPO_PUBLIC_APP_VERSION=1.0.0

# Configuration Sentry (optionnel)
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Configuration des services externes
EXPO_PUBLIC_AGENT_API_URL=https://agents.offlipay.com
EXPO_PUBLIC_VOUCHER_API_URL=https://vouchers.offlipay.com
```

### 4. Installation des outils Expo
```bash
# Installer Expo CLI globalement
npm install -g @expo/cli

# Installer EAS CLI pour les builds
npm install -g eas-cli
```

## 🏃‍♂️ Démarrage rapide

### Démarrer l'application
```bash
# Démarrer le serveur de développement
npm start

# Ou avec des options spécifiques
npm run dev          # Mode développement
npm run preview      # Mode preview
```

### Lancer sur différentes plateformes
```bash
# Android
npm run android
# ou
npx expo run:android

# iOS
npm run ios
# ou
npx expo run:ios

# Web
npm run web
# ou
npx expo start --web
```

## 🔧 Configuration avancée

### Configuration Android

#### 1. Variables d'environnement Android
```bash
# Ajouter au ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 2. Créer un émulateur Android
```bash
# Lister les AVD disponibles
avdmanager list avd

# Créer un nouvel AVD
avdmanager create avd -n OffliPay_Emulator -k "system-images;android-33;google_apis;x86_64"
```

### Configuration iOS

#### 1. Installation des pods (si nécessaire)
```bash
cd ios && pod install && cd ..
```

#### 2. Ouvrir dans Xcode
```bash
npx expo run:ios --device
```

### Configuration Web

#### 1. Build pour production web
```bash
npm run build:web
```

#### 2. Servir localement
```bash
npx serve dist
```

## 🧪 Vérification de l'installation

### Tests de base
```bash
# Lancer les tests unitaires
npm test

# Vérifier le linting
npm run lint

# Vérifier les types TypeScript
npm run type-check
```

### Tests d'intégration
```bash
# Tester le build Android
npm run build:android

# Tester le build iOS
npm run build:ios

# Tester le build Web
npm run build:web
```

## 🐛 Résolution des problèmes courants

### Problème : Metro bundler ne démarre pas
```bash
# Nettoyer le cache Metro
npx expo start --clear

# Ou nettoyer complètement
rm -rf node_modules
npm install
npx expo start --clear
```

### Problème : Erreurs de dépendances natives
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Pour iOS, réinstaller les pods
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
```

### Problème : Erreurs de build Android
```bash
# Nettoyer le build Android
cd android && ./gradlew clean && cd ..

# Vérifier les variables d'environnement
echo $ANDROID_HOME
```

### Problème : Erreurs de build iOS
```bash
# Nettoyer le build iOS
cd ios && xcodebuild clean && cd ..

# Réinstaller les pods
cd ios && pod deintegrate && pod install && cd ..
```

## 📱 Configuration des appareils

### Android physique
1. Activer le mode développeur
2. Activer le débogage USB
3. Connecter l'appareil
4. Autoriser le débogage USB

### iOS physique
1. Connecter l'appareil
2. Faire confiance à l'ordinateur
3. Enregistrer l'appareil dans le portail développeur Apple
4. Configurer le profil de provisioning

## 🔄 Mise à jour

### Mettre à jour les dépendances
```bash
# Vérifier les mises à jour disponibles
npm outdated

# Mettre à jour toutes les dépendances
npm update

# Mettre à jour Expo SDK
npx expo install --fix
```

### Mettre à jour Expo CLI
```bash
npm install -g @expo/cli@latest
```

## 📚 Ressources supplémentaires

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Guide Android Studio](https://developer.android.com/studio/intro)
- [Guide Xcode](https://developer.apple.com/xcode/)

## 🆘 Support

Si vous rencontrez des problèmes lors de l'installation :

1. Vérifiez les [Issues GitHub](https://github.com/sabowaryan/offlipay/issues)
2. Consultez la [documentation Expo](https://docs.expo.dev/troubleshooting/)
3. Créez une nouvelle issue avec les détails de votre problème