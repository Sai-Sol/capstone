import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bot, 
  Send, 
  User, 
  Zap, 
  MessageSquare,
  Lightbulb,
  Code,
  TrendingUp,
  Shield,
  RefreshCw,
  Coins,
  BarChart3
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  category?: string;
}

interface QuickAction {
  label: string;
  query: string;
  icon: any;
  category: string;
}

export default function BlockchainAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your Blockchain & Crypto AI assistant. I can help you with smart contracts, DeFi protocols, trading strategies, Web3 development, and blockchain technology. What would you like to know?",
      timestamp: Date.now(),
      category: 'greeting'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { label: "Smart Contract Security", query: "What are the best practices for smart contract security?", icon: Shield, category: "security" },
    { label: "DeFi Yield Farming", query: "How does yield farming work in DeFi?", icon: TrendingUp, category: "defi" },
    { label: "Gas Optimization", query: "How can I optimize gas costs for my transactions?", icon: Zap, category: "optimization" },
    { label: "Web3 Development", query: "What are the essential tools for Web3 development?", icon: Code, category: "development" },
    { label: "Crypto Trading", query: "What are effective cryptocurrency trading strategies?", icon: BarChart3, category: "trading" },
    { label: "Blockchain Networks", query: "Compare different blockchain networks and their features", icon: Coins, category: "networks" }
  ];

  // Comprehensive blockchain/crypto knowledge base
  const blockchainResponses: Record<string, string> = {
    "smart contract security": `Smart contract security best practices include:

**Code Auditing:**
• Use formal verification tools like Mythril, Slither, or Echidna
• Conduct multiple independent security audits
• Implement comprehensive test coverage (>95%)

**Common Vulnerabilities:**
• Reentrancy attacks - Use ReentrancyGuard from OpenZeppelin
• Integer overflow/underflow - Use SafeMath or Solidity 0.8+
• Access control issues - Implement proper role-based permissions
• Front-running - Use commit-reveal schemes or MEV protection

**Development Practices:**
• Follow the Checks-Effects-Interactions pattern
• Use established libraries like OpenZeppelin
• Implement circuit breakers and pause mechanisms
• Regular security monitoring and incident response plans`,

    "defi": `DeFi (Decentralized Finance) protocols enable financial services without intermediaries:

**Yield Farming:**
• Provide liquidity to DEXs like Uniswap, SushiSwap
• Stake tokens in lending protocols (Aave, Compound)
• Participate in liquidity mining programs
• Calculate APY considering impermanent loss risks

**Key DeFi Protocols:**
• **AMMs**: Uniswap V3, Curve, Balancer
• **Lending**: Aave, Compound, MakerDAO
• **Derivatives**: dYdX, Synthetix, GMX
• **Insurance**: Nexus Mutual, Cover Protocol

**Risk Management:**
• Smart contract risks and audit history
• Impermanent loss in liquidity provision
• Liquidation risks in lending protocols
• Governance token volatility`,

    "gas optimization": `Gas optimization strategies for Ethereum transactions:

**Smart Contract Optimization:**
• Use 'view' and 'pure' functions when possible
• Pack struct variables efficiently
• Use events instead of storage for logging
• Implement batch operations for multiple transactions

**Transaction Optimization:**
• Monitor gas prices using ETH Gas Station
• Use Layer 2 solutions (Polygon, Arbitrum, Optimism)
• Time transactions during low network congestion
• Use gas tokens during high gas periods

**Code Patterns:**
• Use 'unchecked' blocks for safe arithmetic
• Minimize external contract calls
• Use assembly for gas-critical operations
• Implement efficient data structures`,

    "web3 development": `Essential Web3 development tools and frameworks:

**Development Frameworks:**
• **Hardhat**: Comprehensive Ethereum development environment
• **Foundry**: Fast, portable toolkit written in Rust
• **Truffle**: Mature development framework with testing suite
• **Brownie**: Python-based development framework

**Frontend Libraries:**
• **ethers.js**: Lightweight Ethereum library
• **web3.js**: Original Ethereum JavaScript API
• **wagmi**: React hooks for Ethereum
• **RainbowKit**: Wallet connection library

**Testing & Deployment:**
• **Ganache**: Local blockchain for testing
• **Tenderly**: Smart contract monitoring and debugging
• **OpenZeppelin Defender**: Secure operations platform
• **IPFS**: Decentralized storage for dApps`,

    "trading": `Effective cryptocurrency trading strategies:

**Technical Analysis:**
• Support and resistance levels
• Moving averages (EMA, SMA)
• RSI, MACD, Bollinger Bands
• Volume analysis and market sentiment

**DeFi Trading:**
• Arbitrage opportunities across DEXs
• Liquidity provision strategies
• Yield farming optimization
• MEV (Maximal Extractable Value) strategies

**Risk Management:**
• Position sizing (never risk more than 2-5% per trade)
• Stop-loss and take-profit orders
• Portfolio diversification across sectors
• Dollar-cost averaging for long-term positions

**Advanced Strategies:**
• Grid trading for range-bound markets
• Perpetual futures and options trading
• Cross-chain arbitrage opportunities
• Algorithmic trading with APIs`,

    "blockchain networks": `Comparison of major blockchain networks:

**Ethereum:**
• Pros: Largest ecosystem, most developers, battle-tested
• Cons: High gas fees, slower transactions (15 TPS)
• Best for: DeFi, NFTs, established protocols

**Binance Smart Chain (BSC):**
• Pros: Low fees, fast transactions, EVM compatible
• Cons: More centralized, fewer validators
• Best for: Gaming, high-frequency trading

**Polygon:**
• Pros: Ethereum Layer 2, very low fees, fast finality
• Cons: Dependent on Ethereum security
• Best for: DeFi, gaming, enterprise applications

**Solana:**
• Pros: Very fast (65k TPS), low fees, growing ecosystem
• Cons: Network stability issues, less decentralized
• Best for: High-frequency applications, NFTs

**Avalanche:**
• Pros: Sub-second finality, subnet architecture
• Cons: Smaller ecosystem compared to Ethereum
• Best for: Enterprise applications, custom blockchains`,

    "nft": `NFT (Non-Fungible Token) ecosystem overview:

**Technical Standards:**
• ERC-721: Basic NFT standard
• ERC-1155: Multi-token standard (fungible + non-fungible)
• ERC-2981: NFT royalty standard
• Metadata standards (JSON, IPFS storage)

**Major Marketplaces:**
• OpenSea: Largest NFT marketplace
• LooksRare: Community-owned with rewards
• Foundation: Curated art platform
• SuperRare: Digital art focus

**Creation & Minting:**
• Use platforms like OpenSea, Rarible for no-code minting
• Deploy custom contracts for advanced features
• Consider gas costs and network choice
• Implement proper metadata and IPFS storage`,

    "dao": `DAO (Decentralized Autonomous Organization) fundamentals:

**Governance Mechanisms:**
• Token-based voting (1 token = 1 vote)
• Quadratic voting for more democratic decisions
• Delegation systems for expertise-based voting
• Multi-sig wallets for execution

**Popular DAO Frameworks:**
• **Aragon**: Comprehensive DAO creation platform
• **DAOstack**: Scalable governance protocols
• **Colony**: Reputation-based governance
• **Snapshot**: Off-chain voting platform

**Legal Considerations:**
• Regulatory compliance varies by jurisdiction
• Consider legal entity formation (LLC, Foundation)
• Tax implications for token holders
• Liability and governance responsibilities`,

    "layer 2": `Layer 2 scaling solutions for Ethereum:

**Types of L2 Solutions:**
• **Optimistic Rollups**: Arbitrum, Optimism
• **ZK Rollups**: zkSync, StarkNet, Polygon zkEVM
• **State Channels**: Lightning Network concept for Ethereum
• **Sidechains**: Polygon PoS, xDai

**Trade-offs:**
• **Security**: Inherits Ethereum security vs. independent security
• **Speed**: 1000-4000 TPS vs. Ethereum's 15 TPS
• **Cost**: 10-100x cheaper than mainnet
• **Finality**: Instant vs. 7-day withdrawal periods

**Development Considerations:**
• Bridge security and liquidity
• Cross-chain communication protocols
• User experience and wallet integration
• Ecosystem maturity and tooling support`
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Check for specific blockchain/crypto topics
    for (const [key, response] of Object.entries(blockchainResponses)) {
      if (lowerQuery.includes(key.replace(/ /g, '')) || 
          lowerQuery.includes(key) ||
          key.split(' ').some(word => lowerQuery.includes(word))) {
        return response;
      }
    }
    
    // General blockchain responses
    if (lowerQuery.includes("ethereum") || lowerQuery.includes("eth")) {
      return "Ethereum is the world's programmable blockchain, enabling smart contracts and decentralized applications. It uses Proof of Stake consensus and supports a vast ecosystem of DeFi protocols, NFTs, and dApps. Current challenges include scalability and gas costs, addressed by Layer 2 solutions like Arbitrum and Optimism.";
    }
    
    if (lowerQuery.includes("bitcoin") || lowerQuery.includes("btc")) {
      return "Bitcoin is the first and largest cryptocurrency, designed as digital gold and store of value. It uses Proof of Work consensus and has a fixed supply of 21 million coins. Bitcoin's Lightning Network enables faster, cheaper transactions for everyday use.";
    }
    
    if (lowerQuery.includes("solidity")) {
      return "Solidity is Ethereum's smart contract programming language. Key concepts include: state variables, functions, modifiers, events, and inheritance. Best practices: use OpenZeppelin libraries, implement proper access controls, handle errors gracefully, and optimize for gas efficiency.";
    }
    
    if (lowerQuery.includes("metamask") || lowerQuery.includes("wallet")) {
      return "MetaMask is the most popular Ethereum wallet browser extension. It enables interaction with dApps, transaction signing, and asset management. For development: use window.ethereum API, handle connection states, and implement proper error handling for user interactions.";
    }
    
    if (lowerQuery.includes("uniswap") || lowerQuery.includes("dex")) {
      return "Uniswap is the leading decentralized exchange using automated market makers (AMM). V3 introduces concentrated liquidity for capital efficiency. Key concepts: liquidity pools, impermanent loss, slippage, and arbitrage opportunities.";
    }
    
    if (lowerQuery.includes("staking") || lowerQuery.includes("validator")) {
      return "Staking involves locking tokens to secure Proof of Stake networks and earn rewards. Ethereum 2.0 requires 32 ETH to run a validator, or you can use liquid staking services like Lido or Rocket Pool. Consider risks: slashing, lockup periods, and smart contract risks.";
    }
    
    // Default response for non-blockchain topics
    return "I specialize in blockchain technology, cryptocurrency, DeFi, smart contracts, and Web3 development. I can help with trading strategies, protocol analysis, security best practices, and technical implementation. What specific blockchain or crypto topic would you like to explore?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateResponse(inputValue),
        timestamp: Date.now(),
        category: 'response'
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "Chat cleared! I'm ready to help you with blockchain and cryptocurrency questions. What would you like to know?",
      timestamp: Date.now(),
      category: 'greeting'
    }]);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Chat Interface */}
      <div className="lg:col-span-3">
        <Card className="quantum-card h-[600px] flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <Bot className="h-6 w-6 text-primary quantum-pulse" />
                </div>
                <div>
                  <CardTitle className="text-xl">Blockchain AI Assistant</CardTitle>
                  <CardDescription>Specialized in crypto, DeFi, and Web3 technology</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearChat}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'bot' && (
                        <div className="p-2 bg-primary/20 rounded-full shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted/50 border border-primary/10'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-60 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="p-2 bg-muted/50 rounded-full shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted/50 border border-primary/10 p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-6 border-t border-primary/20">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about DeFi, smart contracts, trading strategies..."
                  className="quantum-input flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="quantum-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Info */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Quick Topics
            </CardTitle>
            <CardDescription>Popular blockchain & crypto questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => handleQuickAction(action.query)}
                >
                  <action.icon className="mr-3 h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* AI Capabilities */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              AI Expertise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  <Shield className="mr-1 h-3 w-3" />
                  Smart Contracts
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  DeFi Protocols
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                  <Code className="mr-1 h-3 w-3" />
                  Web3 Development
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                  <BarChart3 className="mr-1 h-3 w-3" />
                  Trading Strategies
                </Badge>
              </div>
            </div>

            <Alert className="border-primary/20 bg-primary/5">
              <Bot className="h-4 w-4" />
              <AlertDescription className="text-sm">
                I'm specialized in blockchain technology and cryptocurrency. I provide technical guidance, 
                security best practices, and strategic insights for the Web3 ecosystem.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}