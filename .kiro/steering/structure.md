# Project Structure

## Architecture Pattern
- **Feature-based organization** with clear separation of concerns
- **Service layer** for business logic abstraction
- **Custom hooks** for reusable stateful logic
- **Component composition** with UI/feature component separation

## Directory Structure

### Core Application
```
app/                    # Expo Router file-based routing
├── (tabs)/            # Tab navigation screens
├── auth/              # Authentication screens
├── index.tsx          # Landing/home screen
└── _layout.tsx        # Root layout with providers
```

### Components
```
components/
├── ui/                # Reusable UI components
│   ├── ModalContainer.tsx
│   ├── SectionCard.tsx
│   ├── AmountInput.tsx
│   └── ActionButton.tsx
├── cash-in/           # Feature-specific components
│   ├── MethodSelector.tsx
│   ├── AgentList.tsx
│   └── VoucherInput.tsx
├── onboarding/        # Onboarding flow components
└── [feature-components] # Top-level feature components
```

### Business Logic
```
services/              # Business logic services
├── CashInService.ts   # Cash-in operations
├── WalletService.ts   # Wallet management
└── OnboardingService.ts

hooks/                 # Custom React hooks
├── useCashInValidation.ts
├── useCashInFees.ts
├── useThemeColors.ts
└── useCustomAlert.ts

utils/                 # Utility functions
├── storage.ts         # Database operations
├── crypto.ts          # Cryptographic functions
├── secureStorage/     # Platform-specific secure storage
└── theme.ts           # Theme configuration
```

### Data & Types
```
types/
└── index.ts           # TypeScript interfaces and types

assets/
└── images/            # Static assets
```

### Testing
```
__tests__/
├── components/        # Component tests
├── hooks/             # Hook tests
├── services/          # Service tests
└── integration/       # Integration tests

examples/              # Usage examples and demos
├── CashInModalExample.tsx
└── ComponentExamples.tsx
```

## Naming Conventions

### Files & Directories
- **PascalCase** for React components (`CashInModal.tsx`)
- **camelCase** for hooks (`useCashInValidation.ts`)
- **camelCase** for services (`CashInService.ts`)
- **kebab-case** for feature directories (`cash-in/`)

### Code Conventions
- **Interfaces** prefixed with descriptive names (`User`, `Transaction`)
- **Types** use union types for enums (`CashInMethod = 'agent' | 'voucher' | 'banking'`)
- **Constants** in UPPER_CASE (`COLORS`, `TYPO`)
- **Private methods** prefixed with underscore in classes

## Import Patterns
- Use **path aliases** `@/` for absolute imports
- **Barrel exports** from feature directories
- **Named imports** preferred over default imports for utilities

## Component Architecture
- **Container/Presentational** pattern for complex components
- **Composition over inheritance** with render props and children
- **Custom hooks** for stateful logic extraction
- **Service injection** through context or direct imports

## State Management
- **Local state** with useState/useReducer for component state
- **Custom hooks** for shared stateful logic
- **Service classes** for business logic and data persistence
- **Context providers** for global state (QRScannerProvider)

## Error Handling
- **Service layer** returns success/error objects
- **Custom hooks** manage validation errors
- **Alert system** for user-facing error messages
- **Sentry integration** for error tracking