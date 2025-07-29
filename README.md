# OffliPay - Application de Paiement Mobile

Une application React Native moderne pour les paiements mobiles avec support hors ligne, QR codes et gestion de portefeuille.

## 🚀 Fonctionnalités

### Core
- **Paiements QR** : Génération et scan de QR codes pour les transactions
- **Portefeuille sécurisé** : Gestion des soldes et transactions
- **Mode hors ligne** : Fonctionnement complet sans connexion internet
- **Thème adaptatif** : Support des modes clair/sombre/auto
- **Interface responsive** : Optimisée pour mobile et tablette

### Cash-In (Ajout de fonds)
- **Agents** : Paiement via réseau d'agents physiques
- **Vouchers prépayés** : Codes QR pour recharges
- **Intégration bancaire** : Transferts bancaires directs
- **Calcul automatique des frais** : Selon la méthode choisie
- **Validation en temps réel** : Contrôles de sécurité

### Transactions
- **Historique complet** : Toutes les transactions avec filtres
- **Détails enrichis** : Informations détaillées par transaction
- **Partage** : Export et partage des relevés
- **Recherche** : Recherche par description ou ID
- **Statistiques** : Totaux envoyés/reçus

## 🏗️ Architecture

### Structure des composants
```
components/
├── ui/                    # Composants UI réutilisables
│   ├── ModalContainer.tsx
│   ├── SectionCard.tsx
│   ├── AmountInput.tsx
│   ├── SelectionCard.tsx
│   └── ActionButton.tsx
├── cash-in/              # Composants spécifiques cash-in
│   ├── MethodSelector.tsx
│   ├── AgentList.tsx
│   ├── VoucherInput.tsx
│   └── BankAccountList.tsx
└── [autres composants]
```

### Hooks personnalisés
```
hooks/
├── useCashInValidation.ts    # Validation des formulaires cash-in
├── useCashInFees.ts          # Calcul des frais
├── useCustomAlert.ts         # Gestion des alertes
├── useThemeColors.ts         # Gestion du thème
└── useUserMode.ts           # Mode utilisateur (acheteur/vendeur)
```

### Services
```
services/
├── CashInService.ts          # Logique métier cash-in
├── WalletService.ts          # Gestion du portefeuille
└── [autres services]
```

## 🧪 Tests

### Tests unitaires
```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Structure des tests
```
__tests__/
├── components/
│   ├── ui/
│   │   ├── ModalContainer.test.tsx
│   │   ├── AmountInput.test.tsx
│   │   └── [autres tests composants]
│   └── [tests autres composants]
├── hooks/
│   ├── useCashInValidation.test.ts
│   ├── useCashInFees.test.ts
│   └── [autres tests hooks]
└── services/
    ├── CashInService.test.ts
    ├── WalletService.test.ts
    └── [autres tests services]
```

### Exemples d'utilisation
```
examples/
├── CashInModalExample.tsx    # Exemple d'utilisation du modal cash-in
├── ComponentExamples.tsx     # Démonstration des composants UI
└── HookExamples.tsx          # Exemples d'utilisation des hooks
```

## 📱 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI
- Android Studio (pour Android)
- Xcode (pour iOS, macOS uniquement)

### Installation
```bash
# Cloner le repository
git clone https://github.com/sabowaryan/offlipay.git
cd offlipay

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### Configuration
1. Copier `.env.example` vers `.env`
2. Configurer les variables d'environnement
3. Configurer les clés API si nécessaire

## 🗄️ Base de données

### Tables principales
- **users** : Utilisateurs et portefeuilles
- **transactions** : Historique des transactions
- **balances** : Soldes utilisateurs (nouvelle table)
- **cash_in_transactions** : Transactions d'ajout de fonds
- **agents** : Réseau d'agents
- **vouchers** : Codes prépayés
- **bank_accounts** : Comptes bancaires

### Migration vers la table balances
La nouvelle table `balances` permet une gestion plus fine des soldes :
```sql
CREATE TABLE balances (
  user_id TEXT PRIMARY KEY,
  current_balance REAL DEFAULT 0,
  pending_balance REAL DEFAULT 0,
  last_update TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔧 Développement

### Scripts disponibles
```bash
npm start          # Démarrer l'application
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer sur web
npm test           # Lancer les tests
npm run lint       # Vérifier le code
npm run type-check # Vérifier les types TypeScript
```

### Conventions de code
- **TypeScript** : Utilisation stricte des types
- **ESLint** : Règles de code automatiques
- **Prettier** : Formatage automatique
- **Husky** : Hooks Git pour la qualité

### Structure des commits
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactorisation
test: ajout/modification de tests
chore: tâches de maintenance
```

## 🚀 Déploiement

### Build de production
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Web
npm run build:web
```

### Configuration EAS
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

## 📚 Documentation

### 📖 Guides
- [Guide d'installation](docs/Installation.md) - Installation complète et configuration
- [Architecture](docs/Architecture.md) - Structure et patterns architecturaux
- [API Reference](docs/API.md) - Documentation complète de l'API interne
- [Tests](docs/Tests.md) - Stratégie de test et exemples

### 🧩 Composants
- [CashInModal](docs/CashInModal.md) - Modal d'ajout de fonds (documentation complète)
- [Composants UI](docs/UIComponents.md) - Bibliothèque de composants réutilisables
- [Hooks](docs/Hooks.md) - Hooks personnalisés pour la logique métier

### 🚀 Démarrage rapide
1. **Installation** : Suivez le [guide d'installation](docs/Installation.md)
2. **Architecture** : Comprenez la [structure du projet](docs/Architecture.md)
3. **Développement** : Consultez l'[API reference](docs/API.md) et les [composants UI](docs/UIComponents.md)
4. **Tests** : Implémentez des tests avec le [guide de test](docs/Tests.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/sabowaryan/offlipay/issues)
- **Documentation** : [Wiki](https://github.com/sabowaryan/offlipay/wiki)
- **Discussions** : [GitHub Discussions](https://github.com/sabowaryan/offlipay/discussions)



Développé  par l'équipe OffliPay 