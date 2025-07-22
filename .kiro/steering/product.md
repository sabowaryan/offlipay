# Product Overview

OffliPay is a React Native mobile payment application that enables secure offline transactions through QR codes and wallet management.

## Core Features

- **Offline-first payments**: Complete transaction functionality without internet connectivity
- **QR code transactions**: Generate and scan QR codes for payments
- **Secure wallet management**: Balance tracking and transaction history
- **Cash-in system**: Multiple funding methods (agents, vouchers, bank transfers)
- **Multi-platform support**: iOS, Android, and web deployment

## Key User Flows

1. **Payment Flow**: Scan QR → Confirm amount → Enter PIN → Complete transaction
2. **Cash-in Flow**: Select method → Enter amount → Validate → Add funds to wallet
3. **Transaction History**: View, filter, and export transaction records

## Business Logic

- All transactions are cryptographically signed for security
- Offline transactions sync when connectivity is restored
- Agent network facilitates cash-to-digital conversion
- Voucher system enables prepaid funding options
- Bank integration for direct transfers

## Target Users

- Mobile payment users in areas with limited connectivity
- Merchants accepting digital payments
- Agents facilitating cash-in services