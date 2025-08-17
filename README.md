# QuantumChain - Blockchain Quantum Computing Platform

A revolutionary blockchain-based quantum computing platform that ensures tamper-proof quantum computations through immutable logging on the MegaETH testnet.

## 🚀 Features

- **Quantum Computing**: Execute algorithms on Google Willow, IBM Condor, and Amazon Braket
- **Blockchain Security**: Immutable logging on MegaETH testnet for tamper-proof verification
- **Smart Contracts**: QuantumJobLogger contract for secure job recording
- **Wallet Integration**: MetaMask integration with MegaETH testnet support
- **Real-time Monitoring**: Live blockchain explorer and network statistics
- **Advanced Lab**: Comprehensive quantum algorithm execution environment

## 🔧 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- MegaETH testnet configuration

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:9002](http://localhost:9002) in your browser

### MetaMask Setup

Configure MegaETH testnet in MetaMask:
- **Network Name**: MegaETH Testnet
- **RPC URL**: https://testnet.megaeth.io
- **Chain ID**: 9000
- **Currency Symbol**: ETH
- **Block Explorer**: https://www.megaexplorer.xyz

### MegaETH Testnet Features

**High Performance:**
- 2-second block times for fast confirmations
- 100,000+ TPS theoretical throughput
- Low latency transaction processing

**Developer Tools:**
- Faucet: https://faucet.megaeth.io
- Explorer: https://www.megaexplorer.xyz
- Documentation: https://docs.megaeth.io

**Security:**
- Post-quantum cryptography ready
- EIP-1559 fee mechanism
- Advanced consensus algorithms

## 🔐 Demo Accounts

- **Admin**: admin@example.com / 456
- **User**: p1@example.com / 123

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS with custom quantum theme
- **UI Components**: Radix UI with custom components
- **Animations**: Framer Motion

### Blockchain Integration
- **Network**: MegaETH Testnet (Chain ID: 9000)
- **Smart Contract**: QuantumJobLogger at `0xd1471126F18d76be253625CcA75e16a0F1C5B3e2`
- **Wallet**: MetaMask integration with ethers.js

### Key Components
- **Quantum Lab**: Advanced algorithm execution environment
- **Blockchain Explorer**: Real-time network monitoring
- **Job History**: Comprehensive job tracking and verification
- **Wallet Management**: Secure transaction handling

## 📊 Smart Contract

**Contract Address**: `0xd1471126F18d76be253625CcA75e16a0F1C5B3e2`
**Network**: MegaETH Testnet
**Explorer**: [View on MegaExplorer](https://www.megaexplorer.xyz/address/0xd1471126F18d76be253625CcA75e16a0F1C5B3e2)

### Functions
- `logJob(string jobType, string ipfsHash)`: Log quantum job to blockchain
- `getAllJobs()`: Retrieve all logged jobs

## 🧪 Quantum Providers

- **Google Willow**: 105 qubits with error correction
- **IBM Condor**: 1,121 qubits for large-scale computations  
- **Amazon Braket**: 256 qubits with multi-provider access

## 🔒 Security

- Post-quantum cryptography for future-proof security
- Immutable blockchain logging prevents tampering
- MetaMask integration for secure wallet operations
- Comprehensive input validation and error handling

## 📱 Usage

1. **Connect Wallet**: Use MetaMask to connect to MegaETH testnet
2. **Submit Jobs**: Create quantum algorithms in the Quantum Lab
3. **Monitor Execution**: View real-time results and blockchain verification
4. **Explore Network**: Use blockchain explorer for network insights

## 🛠️ Development

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run typecheck`: TypeScript type checking

### Testing
- `npm test`: Run test suite
- Jest configuration with comprehensive API and component tests

## 🌐 Deployment

The application is configured for deployment on Firebase App Hosting with automatic builds and MegaETH testnet integration.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for secure quantum computing on the blockchain** 🚀