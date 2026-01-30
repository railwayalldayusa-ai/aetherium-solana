import React, { useMemo, useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createBurnInstruction, createMintToInstruction, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useAnchorWallet, ConnectionProvider, WalletProvider, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AETHERIUM_MINT = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F"); 

const BMEMonitor = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const executeBMECycle = async (type) => {
        if (!wallet) return toast.error("Connect SIT-Standard Wallet");
        
        const action = type === 'BURN' ? "Logging Compliance (Burn)" : "Rewarding Node (Mint)";
        const id = toast.loading(`Executing BME ${type}: ${action}...`);

        try {
            const ata = await getAssociatedTokenAddress(AETHERIUM_MINT, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
            const tx = new Transaction();

            if (type === 'BURN') {
                tx.add(createBurnInstruction(ata, AETHERIUM_MINT, wallet.publicKey, 10 * 10**9, [], TOKEN_2022_PROGRAM_ID));
            } else {
                // MINT logic: Issuing rewards to the hardware node
                tx.add(createMintToInstruction(AETHERIUM_MINT, ata, wallet.publicKey, 5 * 10**9, [], TOKEN_2022_PROGRAM_ID));
            }

            const signature = await wallet.sendTransaction(tx, connection);
            await connection.confirmTransaction(signature, "confirmed");

            toast.update(id, { 
                render: type === 'BURN' ? "Audit Sealed: Credits Burned" : "Reward Issued: Tokens Minted to Node", 
                type: "success", isLoading: false, autoClose: 5000 
            });
        } catch (err) {
            toast.update(id, { render: `${type} Failed: Check Permissions`, type: "error", isLoading: false });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '40px', fontFamily: 'monospace' }}>
            <ToastContainer theme="dark" />
            <div style={{ borderBottom: '2px solid #38bdf8', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <h1 style={{ letterSpacing: '2px' }}>AETHERIUM | BME EQUILIBRIUM</h1>
                <WalletMultiButton />
            </div>
            
            <div style={{ marginTop: '50px', display: 'flex', gap: '30px', justifyContent: 'center' }}>
                <div style={{ background: '#0f172a', padding: '30px', borderRadius: '12px', border: '1px solid #ef4444', width: '300px' }}>
                    <p style={{ color: '#64748b' }}>OPERATOR COST</p>
                    <h2 style={{ color: '#ef4444' }}>-10 $AETHERIUM</h2>
                    <button onClick={() => executeBMECycle('BURN')} style={{ width: '100%', background: '#ef4444', border: 'none', padding: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>BURN & LOG DATA</button>
                </div>

                <div style={{ background: '#0f172a', padding: '30px', borderRadius: '12px', border: '1px solid #22c55e', width: '300px' }}>
                    <p style={{ color: '#64748b' }}>NODE REWARD</p>
                    <h2 style={{ color: '#22c55e' }}>+5 $AETHERIUM</h2>
                    <button onClick={() => executeBMECycle('MINT')} style={{ width: '100%', background: '#22c55e', border: 'none', padding: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>MINT REWARDS</button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    return (
        <ConnectionProvider endpoint="https://api.devnet.solana.com">
            <WalletProvider wallets={[useMemo(() => new PhantomWalletAdapter(), [])]} autoConnect>
                <WalletModalProvider><BMEMonitor /></WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
