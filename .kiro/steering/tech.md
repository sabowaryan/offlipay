# Technology Stack

## Framework & Platform
- **React Native 0.79.5** with **React 19.0.0**
- **Expo SDK 53** for cross-platform development
- **Expo Router 5** for file-based navigation
- **TypeScript 5.8** with strict mode enabled

## Key Libraries
- **React Native Paper 5.14** - UI component library
- **Lucide React Native** - Icon system
- **React Native Reanimated 3.17** - Animations
- **Expo Camera/Barcode Scanner** - QR code functionality
- **Expo Secure Store** - Encrypted storage
- **Expo SQLite** - Local database
- **React Native SVG** - Vector graphics and QR generation

## Development Tools
- **ESLint** with Expo config for code quality
- **Prettier** for code formatting
- **Jest 30** with React Native Testing Library for testing
- **Sentry** for error tracking and performance monitoring
- **Metro** bundler with custom configuration

## Build System
- **EAS Build** for production builds
- **Expo CLI** for development workflow
- **Babel** with Expo preset and Reanimated plugin

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run preview      # Start preview build
npm start           # Start production build
```

### Platform Builds
```bash
npm run build:ios      # Build for iOS with icon setup
npm run build:android  # Build for Android with icon setup
npm run build:web      # Export web build
```

### Testing & Quality
```bash
npm test              # Run Jest tests
npm run lint          # Run ESLint
npm run setup:icons   # Setup app icons for all platforms
```

## Configuration Files
- `app.config.js` - Expo configuration
- `tsconfig.json` - TypeScript with path aliases (`@/*`)
- `metro.config.js` - Custom Metro config with Sentry integration
- `babel.config.js` - Babel with Reanimated plugin
- `jest.config.js` - Jest with React Native preset

## Environment Management
- `.env` - Base environment variables
- `.env.local` - Local development overrides  
- `.env.preview` - Preview environment settings
- Environment variants controlled via `APP_VARIANT`