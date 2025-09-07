@@ .. @@
 # QuantumChain - Blockchain Quantum Computing Platform

-A revolutionary blockchain-based quantum computing platform that ensures tamper-proof quantum computations through immutable logging on the MegaETH testnet.
+A revolutionary MegaETH-based quantum computing platform that ensures tamper-proof quantum computations through immutable logging on the ultra-fast MegaETH testnet.

 ## 🚀 Features

 - **Quantum Computing**: Execute algorithms on Google Willow, IBM Condor, and Amazon Braket
-- **Blockchain Security**: Immutable logging on MegaETH testnet for tamper-proof verification
+- **MegaETH Security**: Immutable logging on ultra-fast MegaETH testnet (100k+ TPS) for tamper-proof verification
+- **Multi-Wallet Support**: Connect with MetaMask, OKX Wallet, or Rabby Wallet
 - **Smart Contracts**: QuantumJobLogger contract for secure job recording
-- **Wallet Integration**: MetaMask integration with MegaETH testnet support
+- **Advanced Wallet Integration**: Multi-wallet support with automatic MegaETH network configuration
 - **Real-time Monitoring**: Live blockchain explorer and network statistics

 ## 🔧 Getting Started

 ### Prerequisites

 - Node.js 18+ and npm
-- MetaMask browser extension
+- Web3 wallet (MetaMask, OKX, or Rabby)
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

-### MetaMask Setup
+### Wallet Setup

-Configure MegaETH testnet in MetaMask:
+The app will automatically configure MegaETH testnet in your wallet:
 - **Network Name**: MegaETH Testnet
 - **RPC URL**: https://testnet.megaeth.io
 - **Chain ID**: 9000
 - **Currency Symbol**: ETH
 - **Block Explorer**: https://www.megaexplorer.xyz

+### Supported Wallets
+- **MetaMask** 🦊 - Most popular Ethereum wallet
+- **OKX Wallet** ⭕ - Secure multi-chain wallet  
+- **Rabby Wallet** 🐰 - DeFi-focused browser wallet

 ## 🔐 Demo Accounts

 - **Admin**: admin@example.com / 456
 - **User**: p1@example.com / 123

 ## 🏗️ Architecture

 ### Frontend
 - **Framework**: Next.js 15 with React 18
 - **Styling**: Tailwind CSS with custom quantum theme
 - **UI Components**: Radix UI with custom components
 - **Animations**: Framer Motion
+- **Wallet Integration**: Multi-provider support with ethers.js

 ### Blockchain Integration
 - **Network**: MegaETH Testnet (Chain ID: 9000)
+- **Performance**: 100k+ TPS, 2-second block time
 - **Smart Contract**: QuantumJobLogger at `0xd1471126F18d76be253625CcA75e16a0F1C5B3e2`
-- **Wallet**: MetaMask integration with ethers.js
+- **Wallet Support**: MetaMask, OKX, Rabby with automatic network switching

 ### Key Components
 - **Quantum Lab**: Algorithm execution environment
-- **Blockchain Explorer**: Real-time network monitoring
+- **MegaETH Explorer**: Real-time network monitoring
 - **Job History**: Comprehensive job tracking and verification
+- **Multi-Wallet**: Advanced wallet selection and management

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
-- Immutable blockchain logging prevents tampering
-- MetaMask integration for secure wallet operations
+- Immutable MegaETH blockchain logging prevents tampering
+- Multi-wallet integration for secure operations
 - Comprehensive input validation and error handling
+- Automatic network validation and switching

 ## 📱 Usage

-1. **Connect Wallet**: Use MetaMask to connect to MegaETH testnet
+1. **Connect Wallet**: Choose from MetaMask, OKX, or Rabby to connect to MegaETH testnet
 2. **Submit Jobs**: Create quantum algorithms in the Quantum Lab
 3. **Monitor Execution**: View real-time results and blockchain verification
-- **Explore Network**: Use blockchain explorer for network insights
+- **Explore Network**: Use MegaETH explorer for network insights

 ## 🛠️ Development

 ### Scripts
 - `npm run dev`: Start development server
 - `npm run build`: Build for production
 - `npm run start`: Start production server
 - `npm run lint`: Run ESLint
 - `npm run typecheck`: TypeScript type checking

 ### Testing
 - `npm test`: Run test suite
 - Jest configuration with comprehensive testing
+- Multi-wallet integration tests
+- MegaETH network validation tests

 ## 🌐 Deployment

 The application is configured for deployment on Firebase App Hosting with automatic builds and MegaETH testnet integration.

+## 🔧 Wallet Integration Logic
+
+See `src/lib/wallet-logic-documentation.ts` for comprehensive documentation of:
+- Multi-wallet detection algorithms
+- Network validation and switching logic
+- Connection state management
+- Error handling and recovery
+- Performance optimization strategies
+- Security validation procedures
+
 ## 📄 License

 MIT License - see LICENSE file for details.

 ---

-**Built for secure quantum computing on the blockchain** 🚀
+**Built for secure quantum computing on the ultra-fast MegaETH blockchain** 🚀