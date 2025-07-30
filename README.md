# OffliPay - Mobile Payment Application

A modern React Native application for mobile payments with offline support, QR codes, and wallet management.

## 🚀 Features

### Core
- **QR Payments**: Generate and scan QR codes for transactions
- **Secure Wallet**: Manage balances and transactions
- **Offline Mode**: Fully functional without internet connection
- **Adaptive Theme**: Light/dark/auto mode support
- **Responsive Interface**: Optimized for mobile and tablet

### Cash-In (Add Funds)
- **Agents**: Pay via a network of physical agents
- **Prepaid Vouchers**: QR codes for top-ups
- **Bank Integration**: Direct bank transfers
- **Automatic Fee Calculation**: Based on chosen method
- **Real-Time Validation**: Security checks

### Transactions
- **Full History**: All transactions with filters
- **Detailed Info**: Rich information per transaction
- **Sharing**: Export and share statements
- **Search**: Search by description or ID
- **Statistics**: Totals sent/received

## 🏗️ Architecture

### Component Structure
```
components/
├── ui/                    # Reusable UI components
│   ├── ModalContainer.tsx
│   ├── SectionCard.tsx
│   ├── AmountInput.tsx
│   ├── SelectionCard.tsx
│   └── ActionButton.tsx
├── cash-in/               # Cash-in specific components
│   ├── MethodSelector.tsx
│   ├── AgentList.tsx
│   ├── VoucherInput.tsx
│   └── BankAccountList.tsx
└── [other components]
```

### Custom Hooks
```
hooks/
├── useCashInValidation.ts    # Cash-in form validation
├── useCashInFees.ts          # Fee calculation
├── useCustomAlert.ts         # Alert management
├── useThemeColors.ts         # Theme handling
└── useUserMode.ts            # User mode (buyer/seller)
```

### Services
```
services/
├── CashInService.ts          # Cash-in business logic
├── WalletService.ts          # Wallet management
└── [other services]
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Tests with coverage
npm run test:coverage

# Tests in watch mode
npm run test:watch
```

### Test Structure
```
__tests__/
├── components/
│   ├── ui/
│   │   ├── ModalContainer.test.tsx
│   │   ├── AmountInput.test.tsx
│   │   └── [other component tests]
│   └── [other component tests]
├── hooks/
│   ├── useCashInValidation.test.ts
│   ├── useCashInFees.test.ts
│   └── [other hook tests]
└── services/
    ├── CashInService.test.ts
    ├── WalletService.test.ts
    └── [other service tests]
```

### Usage Examples
```
examples/
├── CashInModalExample.tsx    # Example of cash-in modal usage
├── ComponentExamples.tsx     # UI component showcase
└── HookExamples.tsx          # Hook usage examples
```

## 📱 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Installation
```bash
# Clone the repository
git clone https://github.com/sabowaryan/offlipay.git
cd offlipay

# Install dependencies
npm install

# Start the application
npm start
```

### Configuration
1. Copy `.env.example` to `.env`
2. Set up environment variables
3. Add API keys if needed

## 🗄️ Database

### Main Tables
- **users**: Users and wallets
- **transactions**: Transaction history
- **balances**: User balances (new table)
- **cash_in_transactions**: Cash-in transactions
- **agents**: Agent network
- **vouchers**: Prepaid codes
- **bank_accounts**: Bank accounts

### Migration to balances table
The new `balances` table enables more granular balance management:
```sql
CREATE TABLE balances (
  user_id TEXT PRIMARY KEY,
  current_balance REAL DEFAULT 0,
  pending_balance REAL DEFAULT 0,
  last_update TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔧 Development

### Available Scripts
```bash
npm start          # Start the application
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm test           # Run tests
npm run lint       # Lint code
npm run type-check # TypeScript type check
```

### Code Conventions
- **TypeScript**: Strict type usage
- **ESLint**: Automatic code rules
- **Prettier**: Auto formatting
- **Husky**: Git hooks for quality

### Commit Structure
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: refactoring
test: add/modify tests
chore: maintenance tasks
```

## 🚀 Deployment

### Production Build
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Web
npm run build:web
```

### EAS Configuration
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
- [Installation Guide](docs/Installation.md) - Full installation and setup
- [Architecture](docs/Architecture.md) - Structure and architectural patterns
- [API Reference](docs/API.md) - Full internal API documentation
- [Tests](docs/Tests.md) - Testing strategy and examples

### 🧩 Components
- [CashInModal](docs/CashInModal.md) - Full documentation for cash-in modal
- [UI Components](docs/UIComponents.md) - Reusable components library
- [Hooks](docs/Hooks.md) - Custom hooks for business logic

### 🚀 Quick Start
1. **Installation**: Follow the [installation guide](docs/Installation.md)
2. **Architecture**: Understand the [project structure](docs/Architecture.md)
3. **Development**: See [API reference](docs/API.md) and [UI components](docs/UIComponents.md)
4. **Tests**: Add tests using the [testing guide](docs/Tests.md)

## 🤝 Contribution

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is MIT licensed. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/sabowaryan/offlipay/issues)
- **Documentation**: [Wiki](https://github.com/sabowaryan/offlipay/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/sabowaryan/offlipay/discussions)

Developed by the OffliPay team