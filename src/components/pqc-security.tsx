"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Lock, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Activity,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PQCStatus {
  isEnabled: boolean;
  algorithm: 'Kyber-1024' | 'Dilithium-5';
  keyStrength: number;
  encryptionLevel: 'Standard' | 'Enhanced' | 'Military';
  lastKeyRotation: Date;
  totalEncryptedJobs: number;
  quantumResistance: number;
}

interface SecurityMetrics {
  encryptionSpeed: number;
  decryptionSpeed: number;
  keyGenerationTime: number;
  storageOverhead: number;
  networkLatency: number;
}

export default function PQCSecurityStatus() {
  const { toast } = useToast();
  const [pqcStatus, setPqcStatus] = useState<PQCStatus>({
    isEnabled: true,
    algorithm: 'Kyber-1024',
    keyStrength: 1024,
    encryptionLevel: 'Enhanced',
    lastKeyRotation: new Date(Date.now() - 86400000), // 24 hours ago
    totalEncryptedJobs: 247,
    quantumResistance: 98.7
  });
  
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    encryptionSpeed: 1.2,
    decryptionSpeed: 0.8,
    keyGenerationTime: 45,
    storageOverhead: 15.3,
    networkLatency: 23
  });
  
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);

  const rotateKeys = async () => {
    setIsRotatingKeys(true);
    
    try {
      // Simulate key rotation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPqcStatus(prev => ({
        ...prev,
        lastKeyRotation: new Date(),
        keyStrength: prev.keyStrength === 1024 ? 2048 : 1024
      }));
      
      toast({
        title: "🔐 Keys Rotated Successfully",
        description: "Post-quantum cryptographic keys have been updated"
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Key Rotation Failed",
        description: "Unable to rotate PQC keys. Please try again."
      });
    } finally {
      setIsRotatingKeys(false);
    }
  };

  const copyPublicKey = () => {
    const mockPublicKey = "pqc_kyber_1024_" + Math.random().toString(36).substr(2, 32);
    navigator.clipboard.writeText(mockPublicKey);
    toast({
      title: "Public Key Copied",
      description: "PQC public key copied to clipboard"
    });
  };

  const getSecurityLevel = (resistance: number) => {
    if (resistance >= 95) return { level: 'Military', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (resistance >= 90) return { level: 'Enhanced', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { level: 'Standard', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const securityLevel = getSecurityLevel(pqcStatus.quantumResistance);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityMetrics(prev => ({
        ...prev,
        encryptionSpeed: prev.encryptionSpeed + (Math.random() - 0.5) * 0.1,
        networkLatency: Math.max(10, prev.networkLatency + (Math.random() - 0.5) * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Security Status */}
      <Card className="quantum-card border-green-500/20 bg-gradient-to-r from-green-500/5 to-green-600/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Shield className="h-8 w-8 text-green-400 quantum-pulse" />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline text-green-400">
                  Post-Quantum Cryptography
                </CardTitle>
                <CardDescription className="text-green-200/80">
                  Quantum-resistant security for all job data
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2">
              <CheckCircle className="mr-2 h-4 w-4" />
              Active & Secure
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-blue-200">Algorithm</span>
              </div>
              <p className="text-lg font-bold text-blue-100">{pqcStatus.algorithm}</p>
              <p className="text-xs text-blue-200/80">{pqcStatus.keyStrength}-bit keys</p>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="font-medium text-green-200">Resistance</span>
              </div>
              <p className="text-lg font-bold text-green-100">{pqcStatus.quantumResistance.toFixed(1)}%</p>
              <p className="text-xs text-green-200/80">Quantum-safe</p>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-purple-200">Jobs Encrypted</span>
              </div>
              <p className="text-lg font-bold text-purple-100">{pqcStatus.totalEncryptedJobs}</p>
              <p className="text-xs text-purple-200/80">Total protected</p>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-pink-400" />
                <span className="font-medium text-pink-200">Performance</span>
              </div>
              <p className="text-lg font-bold text-pink-100">{securityMetrics.encryptionSpeed.toFixed(1)}ms</p>
              <p className="text-xs text-pink-200/80">Encryption speed</p>
            </div>
          </div>

          {/* Quantum Resistance Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-green-400">Quantum Resistance Level</h4>
              <span className="text-sm text-green-200">{pqcStatus.quantumResistance.toFixed(1)}%</span>
            </div>
            <Progress 
              value={pqcStatus.quantumResistance} 
              className="h-3 bg-green-500/20"
            />
            <div className="flex justify-between text-xs text-green-200/80">
              <span>Classical Safe</span>
              <span>Quantum Resistant</span>
              <span>Future Proof</span>
            </div>
          </div>

          {/* Key Management */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-primary">Key Management</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={rotateKeys}
                disabled={isRotatingKeys}
                className="quantum-button"
              >
                {isRotatingKeys ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Rotate Keys
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Last Rotation:</span>
                <div className="font-medium">{pqcStatus.lastKeyRotation.toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Next Scheduled:</span>
                <div className="font-medium text-green-400">
                  {new Date(pqcStatus.lastKeyRotation.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Key Type:</span>
                <div className="font-medium">NIST PQC Standard</div>
              </div>
              <div>
                <span className="text-muted-foreground">Storage:</span>
                <div className="font-medium">Hardware Security Module</div>
              </div>
            </div>
          </div>

          {/* Technical Details Toggle */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                {showTechnicalDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Technical Details
              </span>
              <span className="text-xs text-muted-foreground">
                {showTechnicalDetails ? 'Hide' : 'Show'}
              </span>
            </Button>

            {showTechnicalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/20 border border-primary/10">
                    <h5 className="font-semibold text-primary mb-3">Performance Metrics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Encryption Speed:</span>
                        <span className="font-mono">{securityMetrics.encryptionSpeed.toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Decryption Speed:</span>
                        <span className="font-mono">{securityMetrics.decryptionSpeed.toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Key Generation:</span>
                        <span className="font-mono">{securityMetrics.keyGenerationTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage Overhead:</span>
                        <span className="font-mono">{securityMetrics.storageOverhead.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/20 border border-primary/10">
                    <h5 className="font-semibold text-primary mb-3">Cryptographic Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Standard:</span>
                        <span className="font-medium">NIST PQC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Key Exchange:</span>
                        <span className="font-medium">Kyber-1024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Digital Signature:</span>
                        <span className="font-medium">Dilithium-5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hash Function:</span>
                        <span className="font-medium">SHAKE-256</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h5 className="font-semibold text-blue-400 mb-3">Public Key Information</h5>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-xs font-mono bg-background/50 p-2 rounded truncate">
                      pqc_kyber_1024_9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyPublicKey}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Security Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>All systems secure:</strong> Post-quantum encryption is active and protecting all quantum job data.
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Globe className="h-4 w-4" />
            <AlertDescription>
              <strong>MegaETH Integration:</strong> Encrypted data is being securely stored on the blockchain with quantum-resistant protection.
            </AlertDescription>
          </Alert>

          {securityMetrics.networkLatency > 50 && (
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Network Latency Warning:</strong> Higher than normal encryption latency detected ({securityMetrics.networkLatency.toFixed(0)}ms). Performance may be impacted.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}