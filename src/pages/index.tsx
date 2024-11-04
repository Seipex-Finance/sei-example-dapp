import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useEthersProvider, useEthersSigner } from '@/lib/ethersAdapter';
import ConnectButtonWrapper from '@/components/ConnectButtonWrapper';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SEI_VAULT_ADDRESS, SEI_VAULT_ABI } from '@/config/constants';
import Head from 'next/head';

interface Balance {
  balance: string;
  lastUpdate: number;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isPendingTx, setIsPendingTx] = useState(false);

  const { toast } = useToast();
  const { address } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchBalance = async (userAddress: string) => {
    if (!provider || !isMounted) return;

    try {
      if (!balance) {
        setIsInitialLoading(true);
      }
      
      const contract = new ethers.Contract(SEI_VAULT_ADDRESS, SEI_VAULT_ABI, provider);
      const balanceData = await contract.getBalance(userAddress);
      
      setBalance({
        balance: ethers.utils.formatEther(balanceData.balance),
        lastUpdate: balanceData.lastUpdate.toNumber(),
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch balance data",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (address && isMounted) {
      fetchBalance(address);
    }
  }, [address, isMounted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPendingTx && address) {
      interval = setInterval(() => {
        fetchBalance(address);
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPendingTx, address]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !address) return;
    
    // Validate input before sending
    const amount = ethers.utils.parseEther(depositAmount);
    if (amount.lte(0)) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter an amount greater than 0",
      });
      return;
    }

    const contract = new ethers.Contract(SEI_VAULT_ADDRESS, SEI_VAULT_ABI, signer);
    
    try {
      const tx = await contract.deposit({
        value: amount
      });
      
      setIsPendingTx(true);
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: `Successfully deposited ${depositAmount} Sei`,
      });

      await fetchBalance(address);
      setDepositAmount('');
      
    } catch (err: any) {
      // Don't log rejected transactions
      if (err.code !== 'ACTION_REJECTED' && err.code !== 4001) {
        console.error('Error depositing:', err);
      }

      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        toast({
          variant: "destructive",
          title: "Transaction Rejected",
          description: "You rejected the transaction in your wallet",
        });
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        toast({
          variant: "destructive",
          title: "Insufficient Funds",
          description: "You don't have enough Sei to complete this transaction",
        });
      } else if (err.data?.message) {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: err.data.message.replace('execution reverted: ', ''),
        });
      } else {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: err.message || "Failed to deposit Sei",
        });
      }
    } finally {
      setIsPendingTx(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !address) return;
    
    // Validate input before sending
    const amount = ethers.utils.parseEther(withdrawAmount);
    if (amount.lte(0)) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter an amount greater than 0",
      });
      return;
    }

    // Check if amount is greater than balance
    if (balance && ethers.utils.parseEther(withdrawAmount).gt(ethers.utils.parseEther(balance.balance))) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "You don't have enough Sei in the vault",
      });
      return;
    }

    const contract = new ethers.Contract(SEI_VAULT_ADDRESS, SEI_VAULT_ABI, signer);
    
    try {
      const tx = await contract.withdraw(amount);
      
      setIsPendingTx(true);
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: `Successfully withdrew ${withdrawAmount} Sei`,
      });

      await fetchBalance(address);
      setWithdrawAmount('');
      
    } catch (err: any) {
      // Don't log rejected transactions
      if (err.code !== 'ACTION_REJECTED' && err.code !== 4001) {
        console.error('Error withdrawing:', err);
      }

      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        toast({
          variant: "destructive",
          title: "Transaction Rejected",
          description: "You rejected the transaction in your wallet",
        });
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        toast({
          variant: "destructive",
          title: "Insufficient Funds",
          description: "You don't have enough Sei to complete this transaction",
        });
      } else if (err.data?.message) {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: err.data.message.replace('execution reverted: ', ''),
        });
      } else {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: err.message || "Failed to withdraw Sei",
        });
      }
    } finally {
      setIsPendingTx(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <Head>
        <title>Sei Vault Example</title>
        <meta name="description" content="Deposit and withdraw Sei tokens" />
      </Head>

      <main className="min-h-screen py-8">
        <div className="container mx-auto p-4 max-w-2xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Sei Vault Example</h1>
            <ConnectButtonWrapper />
          </div>

          {!address && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Please connect your wallet to manage your Sei
                </p>
              </CardContent>
            </Card>
          )}

          {address && isInitialLoading && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading balance...</p>
              </CardContent>
            </Card>
          )}

          {address && !isInitialLoading && balance && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{balance.balance} Sei</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last update: {new Date(balance.lastUpdate * 1000).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deposit Sei</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Amount</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        step="0.000000000000000001"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Amount in Sei"
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={!depositAmount || isPendingTx}
                      className="w-full"
                    >
                      {isPendingTx ? 'Transaction Pending...' : 'Deposit Sei'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Sei</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAmount">Amount</Label>
                      <Input
                        id="withdrawAmount"
                        type="number"
                        step="0.000000000000000001"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Amount in Sei"
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={!withdrawAmount || isPendingTx}
                      variant="outline"
                      className="w-full"
                    >
                      {isPendingTx ? 'Transaction Pending...' : 'Withdraw Sei'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}