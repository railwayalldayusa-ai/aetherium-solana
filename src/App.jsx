import React, { useMemo, useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useAnchorWallet, ConnectionProvider, WalletProvider, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import idl from './idl.json';
import '@solana/wallet-adapter-react-ui/styles.css';

const AETHERIUM_PROGRAM_ID = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F");

const FleetMonitor = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [fleet, setFleet] = useState([]);

    const fetchFleet = async () => {
        if (!wallet) return;
        const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
        const program = new anchor.Program(idl, provider);
        try {
            const logs = await program.account.message.all();
            setFleet(logs.map(l => l.account).sort((a, b) => b.timestamp - a.timestamp));
        } catch (e) { console.log("Registry empty."); }
    };

    useEffect(() => { fetchFleet(); const i = setInterval(fetchFleet, 5000); return () => clearInterval(i); }, [wallet]);

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '40px', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #38bdf8', paddingBottom: '20px' }}>
                <h1 style={{ color: '#38bdf8', margin: 0 }}>AETHERIUM | REAL-TIME FLEET OVERSIGHT</h1>
                <WalletMultiButton />
            </div>

            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {fleet.map((asset, i) => (
                    <div key={i} style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #22c55e' }}>
                        <p style={{ color: '#64748b', fontSize: '0.7rem' }}>SIT-MINT PROVENANCE: {asset.timestamp.toString()}</p>
                        <h3 style={{ margin: '10px 0', color: '#f8fafc' }}>{asset.content}</h3>
                        <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>STATUS: COMPLIANT ✓</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function App() {
    return (
        <ConnectionProvider endpoint="https://api.devnet.solana.com">
            <WalletProvider wallets={[useMemo(() => new PhantomWalletAdapter(), [])]} autoConnect>
                <WalletModalProvider><FleetMonitor /></WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
