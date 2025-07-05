# OffliPay 📱💳

**Une application de portefeuille numérique offline pour les paiements par QR code**

OffliPay est une application mobile React Native/Expo qui permet d'effectuer des paiements sécurisés sans connexion internet, en utilisant des codes QR et des technologies de synchronisation offline.

## 🌟 Fonctionnalités Principales

### 💰 Gestion de Portefeuille
- **Création de portefeuille sécurisé** avec cryptographie RSA
- **Gestion du solde** en temps réel
- **Historique des transactions** détaillé
- **Mode acheteur/vendeur** pour différents contextes d'utilisation

### 📱 Paiements par QR Code
- **Génération de QR codes** pour les demandes de paiement
- **Scanner de QR codes** pour effectuer des paiements
- **Transactions sécurisées** avec signatures cryptographiques
- **Validation automatique** des paiements

### 🔒 Sécurité
- **Cryptographie RSA** pour les signatures de transactions
- **Stockage sécurisé** des clés privées
- **Hachage sécurisé** des codes PIN
- **Validation des signatures** pour prévenir la fraude

### 📊 Interface Utilisateur
- **Design moderne** avec thème sombre
- **Interface intuitive** avec navigation par onglets
- **Animations fluides** et feedback haptique
- **Responsive design** pour différentes tailles d'écran

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend**: React Native avec Expo
- **Navigation**: Expo Router avec navigation par onglets
- **Base de données**: SQLite avec expo-sqlite
- **Cryptographie**: expo-crypto
- **Stockage sécurisé**: expo-secure-store
- **QR Codes**: react-native-qrcode-svg
- **Scanner QR**: expo-camera avec expo-barcode-scanner
- **UI Components**: Lucide React Native
- **Styles**: StyleSheet natif avec LinearGradient

### Structure du Projet
```
offlipay/
├── app/                    # Pages de l'application (Expo Router)
│   ├── (tabs)/            # Navigation par onglets
│   │   ├── index.tsx      # Écran d'accueil
│   │   ├── pay.tsx        # Écran de paiement
│   │   ├── transactions.tsx # Historique des transactions
│   │   └── settings.tsx   # Paramètres
│   ├── auth/              # Authentification
│   └── _layout.tsx        # Layout principal
├── components/            # Composants réutilisables
│   ├── QRGenerator.tsx    # Générateur de QR codes
│   ├── QRScanner.tsx      # Scanner de QR codes
│   └── TransactionItem.tsx # Élément de transaction
├── services/              # Services métier
│   └── WalletService.ts   # Service de gestion du portefeuille
├── utils/                 # Utilitaires
│   ├── crypto.ts          # Fonctions cryptographiques
│   ├── storage.ts         # Service de stockage
│   └── secureStorage.ts   # Stockage sécurisé
├── types/                 # Définitions TypeScript
│   └── index.ts           # Interfaces et types
└── hooks/                 # Hooks personnalisés
    └── useFrameworkReady.ts
```

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI
- Un appareil mobile ou émulateur

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd offlipay
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer l'application**
```bash
# Pour Windows (modifié pour éviter les problèmes de variables d'environnement)
npm run dev

# Ou utiliser npx
npx expo start
```

4. **Scanner le QR code** avec l'application Expo Go sur votre mobile

### Configuration pour le Développement

Le projet utilise Expo avec les configurations suivantes :
- **Metro bundler** pour le développement
- **TypeScript** pour la sécurité des types
- **ESLint** pour la qualité du code
- **Prettier** pour le formatage

## 📱 Utilisation de l'Application

### Création d'un Portefeuille
1. Ouvrir l'application
2. Choisir "Créer un nouveau portefeuille"
3. Saisir nom, téléphone et code PIN
4. Le portefeuille est créé avec un ID unique

### Effectuer un Paiement
1. Aller dans l'onglet "Pay"
2. Choisir "Scanner QR" pour payer
3. Scanner le QR code du destinataire
4. Confirmer le montant et la description
5. Le paiement est traité et le solde mis à jour

### Générer un QR de Paiement
1. Aller dans l'onglet "Pay"
2. Choisir "Générer QR"
3. Saisir le montant et l'ID du portefeuille destinataire
4. Le QR code est généré pour être partagé

### Consulter l'Historique
1. Aller dans l'onglet "History"
2. Voir toutes les transactions envoyées et reçues
3. Filtrer par type et statut
4. Voir les détails de chaque transaction

## 🔧 Fonctionnalités Techniques

### Cryptographie
- **Génération de clés RSA** pour chaque portefeuille
- **Signatures de transactions** pour l'authenticité
- **Hachage sécurisé** des codes PIN
- **Validation cryptographique** des paiements

### Stockage
- **SQLite local** pour les données utilisateur et transactions
- **Stockage sécurisé** pour les clés privées et codes PIN
- **Synchronisation offline** préparée pour les futures fonctionnalités

### Sécurité des Transactions
- **Nonces uniques** pour chaque transaction
- **Horodatage** pour prévenir les attaques par rejeu
- **Validation des signatures** avant traitement
- **Vérification des soldes** avant paiement

## 🎨 Design et UX

### Thème
- **Thème sombre** moderne et élégant
- **Couleur principale** : Vert (#00E676) pour les actions
- **Typographie** : Inter font family
- **Gradients** pour les éléments visuels

### Navigation
- **Navigation par onglets** intuitive
- **4 onglets principaux** : Home, Pay, History, Settings
- **Transitions fluides** entre les écrans
- **Feedback haptique** pour les interactions

## 🔮 Fonctionnalités Futures

### Synchronisation Offline
- **Synchronisation Bluetooth** entre appareils
- **Synchronisation SMS** pour les zones sans réseau
- **Synchronisation WiFi** pour les réseaux locaux
- **Gestion des conflits** de synchronisation

### Améliorations Sécurité
- **Chiffrement end-to-end** des transactions
- **Authentification biométrique** (empreinte, Face ID)
- **Backup sécurisé** des portefeuilles
- **Récupération de portefeuille** avec phrases de récupération

### Fonctionnalités Avancées
- **Multi-devices** : utiliser le même portefeuille sur plusieurs appareils
- **Notifications push** pour les transactions
- **Export des données** en PDF/CSV
- **Intégration avec des services tiers**

## 🐛 Dépannage

### Problèmes Courants

**Erreur "EXPO_NO_TELEMETRY n'est pas reconnu"**
```bash
# Solution : Modifier le script dans package.json
"dev": "expo start"
```

**Expo CLI non reconnu**
```bash
# Installer Expo CLI globalement
npm install -g @expo/cli
```

**Problèmes de permissions caméra**
- Vérifier les permissions dans les paramètres de l'appareil
- Redémarrer l'application après avoir accordé les permissions

### Logs et Debug
```bash
# Voir les logs en temps réel
npx expo start --clear

# Mode debug
npx expo start --dev-client
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Expo
- Vérifier les logs de l'application

---

**OffliPay** - Paiements sécurisés, même sans réseau 🌐➡️📱 