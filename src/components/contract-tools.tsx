"use client";

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Code, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Settings,
  Eye,
  Zap,
  Shield,
  RefreshCw
} from "lucide-react";

function getStatusColor(status: string) {
  switch (status) {
    case "verified": return "text-green-400 border-green-400/50";
    case "pending": return "text-yellow-400 border-yellow-400/50";
    case "failed": return "text-red-400 border-red-400/50";
    default: return "text-gray-400 border-gray-400/50";
  }
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
}

interface ContractEvent {
  name: string;
  signature: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  args: Record<string, any>;
}

export default function ContractTools() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [contractCode, setContractCode] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>("");
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "failed" | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<string>("");

  const contractTemplates: ContractTemplate[] = [
    {
      id: "erc20",
      name: "ERC-20 Token",
      description: "Standard fungible token contract",
      category: "Token",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialSupply) 
        ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`
    },
    {
      id: "erc721",
      name: "ERC-721 NFT",
      description: "Non-fungible token contract",
      category: "NFT",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}`
    },
    {
      id: "multisig",
      name: "Multi-Signature Wallet",
      description: "Secure multi-signature wallet contract",
      category: "Wallet",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value,
        bytes data
    );

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    Transaction[] public transactions;

    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 &&
            _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }
}`
    }
  ];

  // Mock events data
  useEffect(() => {
    const mockEvents: ContractEvent[] = [
      {
        name: "Transfer",
        signature: "Transfer(address,address,uint256)",
        timestamp: Date.now() - 3600000,
        blockNumber: 18500000,
        transactionHash: "0x1234567890abcdef...",
        args: { from: "0x123...", to: "0x456...", value: "1000000000000000000" }
      },
      {
        name: "Approval",
        signature: "Approval(address,address,uint256)",
        timestamp: Date.now() - 7200000,
        blockNumber: 18499950,
        transactionHash: "0xabcdef1234567890...",
        args: { owner: "0x123...", spender: "0x789...", value: "5000000000000000000" }
      }
    ];
    setEvents(mockEvents);
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = contractTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setContractCode(template.code);
    }
  };

  const deployContract = async () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to deploy contracts."
      });
      return;
    }

    toast({
      title: "Deploying Contract",
      description: "Contract deployment initiated. Please confirm in your wallet."
    });

    // Simulate deployment
    setTimeout(() => {
      toast({
        title: "Contract Deployed",
        description: "Your contract has been successfully deployed to the network."
      });
    }, 3000);
  };

  const verifyContract = async () => {
    if (!contractAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please enter a contract address to verify."
      });
      return;
    }

    setVerificationStatus("pending");
    
    // Simulate verification process
    setTimeout(() => {
      setVerificationStatus("verified");
      toast({
        title: "Contract Verified",
        description: "Contract source code has been successfully verified."
      });
    }, 2000);
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(eventFilter.toLowerCase()) ||
    event.signature.toLowerCase().includes(eventFilter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Tabs defaultValue="deploy" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-14">
          <TabsTrigger value="deploy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Upload className="mr-2 h-4 w-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="verify" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="mr-2 h-4 w-4" />
            Verify
          </TabsTrigger>
          <TabsTrigger value="interact" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Interact
          </TabsTrigger>
          <TabsTrigger value="monitor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="mr-2 h-4 w-4" />
            Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Contract Deployment
              </CardTitle>
              <CardDescription>Deploy smart contracts using templates or custom code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Contract Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="quantum-input">
                    <SelectValue placeholder="Choose a template or start from scratch" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Contract Source Code</Label>
                <Textarea
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  placeholder="Enter your Solidity contract code here..."
                  className="quantum-input min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={deployContract}
                  disabled={!contractCode || !isConnected}
                  className="quantum-button flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Deploy Contract
                </Button>
                <Button variant="outline" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Deployment
                </Button>
              </div>

              {!isConnected && (
                <Alert className="border-yellow-500/20 bg-yellow-500/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Connect your wallet to deploy contracts to the blockchain.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Contract Verification
              </CardTitle>
              <CardDescription>Verify contract source code on the blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Contract Address</Label>
                <Input
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  className="quantum-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Source Code</Label>
                <Textarea
                  placeholder="Paste your contract source code here..."
                  className="quantum-input min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Compiler Version</Label>
                  <Select>
                    <SelectTrigger className="quantum-input">
                      <SelectValue placeholder="Select compiler version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.8.19">v0.8.19</SelectItem>
                      <SelectItem value="0.8.18">v0.8.18</SelectItem>
                      <SelectItem value="0.8.17">v0.8.17</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Optimization</Label>
                  <Select>
                    <SelectTrigger className="quantum-input">
                      <SelectValue placeholder="Optimization settings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled (200 runs)</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={verifyContract}
                disabled={!contractAddress || verificationStatus === "pending"}
                className="quantum-button w-full"
              >
                {verificationStatus === "pending" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Contract
                  </>
                )}
              </Button>

              {verificationStatus === "verified" && (
                <Alert className="border-green-500/20 bg-green-500/5">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Contract successfully verified! Source code is now publicly available.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interact" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Contract Interaction
              </CardTitle>
              <CardDescription>Read from and write to smart contracts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Contract Address</Label>
                <Input
                  placeholder="0x..."
                  className="quantum-input"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Read Functions</h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/20 border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">balanceOf</span>
                      <Badge variant="outline">view</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="address" className="quantum-input" />
                      <Button variant="outline">Query</Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/20 border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">totalSupply</span>
                      <Badge variant="outline">view</Badge>
                    </div>
                    <Button variant="outline" className="w-full">Query</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Write Functions</h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/20 border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">transfer</span>
                      <Badge variant="destructive">payable</Badge>
                    </div>
                    <div className="space-y-2">
                      <Input placeholder="to (address)" className="quantum-input" />
                      <Input placeholder="amount (uint256)" className="quantum-input" />
                      <Button className="quantum-button w-full">
                        <Zap className="mr-2 h-4 w-4" />
                        Execute Transaction
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="mt-8">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Event Monitoring
              </CardTitle>
              <CardDescription>Monitor contract events and transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Filter events..."
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="quantum-input flex-1"
                />
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-4">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{event.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Block #{event.blockNumber.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-mono text-sm">{event.signature}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(event.args).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}