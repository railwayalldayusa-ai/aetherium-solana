import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useAnchorWallet, ConnectionProvider, WalletProvider, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Buffer } from 'buffer';
import idl from './idl.json';
import '@solana/wallet-adapter-react-ui/styles.css';

window.Buffer = Buffer;

const AetheriumInterface = () => {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const programId = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F");

    const refreshData = useCallback(async () => {
        if (wallet) {
            const bal = await connection.getBalance(wallet.publicKey);
            setBalance(bal / LAMPORTS_PER_SOL);
            const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
            const program = new anchor.Program(idl, provider);
            try {
                const logs = await program.account.message.all();
                setMessages(logs.map(l => l.account).sort((a, b) => b.timestamp - a.timestamp));
            } catch (e) { console.log("Feed empty."); }
        }
    }, [wallet, connection]);

    useEffect(() => { refreshData(); }, [wallet, refreshData]);

    const sendTip = async (authorPubkey) => {
        if (!wallet) return alert("Connect wallet to tip!");
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: authorPubkey,
                    lamports: 0.01 * LAMPORTS_PER_SOL,
                })
            );
            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "confirmed");
            alert("Tip Sent! 0.01 SOL delivered.");
            refreshData();
        } catch (err) { alert("Tip failed: " + err.message); }
    };

    const postToWall = async () => {
        if (!content) return alert("Enter a message!");
        setLoading(true);
        const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
        const program = new anchor.Program(idl, provider);
        const messageAccount = Keypair.generate();
        try {
            await program.methods.postMessage(content)
                .accounts({ messageAccount: messageAccount.publicKey, author: wallet.publicKey, systemProgram: SystemProgram.programId })
                .signers([messageAccount])
                .rpc();
            setContent("");
            refreshData();
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#020617', color: 'white', fontFamily: 'monospace', padding: '40px' }}>
            <h1 style={{ color: '#38bdf8', textShadow: '0 0 10px #38bdf8' }}>AETHERIUM WALL</h1>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', width: '400px', textAlign: 'center', marginBottom: '20px' }}>
                <p>Balance: <span style={{ color: '#fbbf24' }}>{balance.toFixed(4)} SOL</span></p>
                <WalletMultiButton style={{ marginTop: '10px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Say something..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', background: '#020617', color: 'white', width: '250px' }} />
                <button onClick={postToWall} disabled={loading} style={{ padding: '12px 24px', background: '#38bdf8', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>POST</button>
            </div>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ background: '#0f172a', margin: '10px 0', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.7rem', color: '#64748b' }}>Author: {m.author.toBase58().slice(0, 8)}...</p>
                            <p style={{ margin: 0 }}>{m.content}</p>
                        </div>
                        <button onClick={() => sendTip(m.author)} style={{ background: '#fbbf24', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#020617' }}>TIP 0.01 SOL</button>
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
                <WalletModalProvider><AetheriumInterface /></WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
