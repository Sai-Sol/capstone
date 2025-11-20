"use client";

import MetaMaskConnect from "@/components/metamask-connect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetaMaskDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">MetaMask Connection Demo</h1>
          <p className="text-muted-foreground">
            Simple MetaMask-only wallet connection with MEGA Testnet v2 support
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to interact with MEGA Testnet v2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetaMaskConnect />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Network Name</p>
                <p className="font-semibold">MEGA Testnet v2</p>
              </div>
              <div>
                <p className="text-muted-foreground">Chain ID</p>
                <p className="font-semibold">6343 (0x18C7)</p>
              </div>
              <div>
                <p className="text-muted-foreground">RPC Endpoint</p>
                <p className="font-mono text-xs break-all">timothy.megaeth.com/rpc</p>
              </div>
              <div>
                <p className="text-muted-foreground">Currency Symbol</p>
                <p className="font-semibold">ETH</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Block Explorer</p>
                <p className="font-mono text-xs break-all">megaeth-testnet-v2.blockscout.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Detects MetaMask installation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Shows friendly alert if MetaMask is not installed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Displays user address, network name, and balance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Soft warning for wrong network (no errors thrown)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>No automatic network switching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Console logs for debugging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Handles disconnection and account changes</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
