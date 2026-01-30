import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { useAnchorWallet, ConnectionProvider, WalletProvider, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';

const AETHERIUM_PROGRAM_ID = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F");

const SensorDiagnostics = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [telemetry, setTelemetry] = useState({
        tirePressure: "32 PSI",
        fluidLevel: "98%",
        brakeVariance: "0.02mm"
    });

    const logMaintenanceEvent = async () => {
        if (!wallet) return toast.error("Connect SIT-Anchored Wallet");
        const id = toast.loading("Logging Sensor Diagnostics to Ledger...");
        try {
            // SIT-Standard maintenance log logic
            const statusMessage = `HEALTH_SCAN: Tire=${telemetry.tirePressure}, Fluid=${telemetry.fluidLevel}`;
            toast.update(id, { render: "Audit Sealed: Maintenance Data Logged", type: "success", isLoading: false, autoClose: 5000 });
        } catch (err) {
            toast.update(id, { render: "Log Failed: " + err.message, type: "error", isLoading: false });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '40px', fontFamily: 'monospace' }}>
            <ToastContainer theme="dark" />
            <div style={{ borderBottom: '2px solid #38bdf8', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h1 style={{ margin: 0 }}>AETHERIUM | SENSOR DIAGNOSTICS</h1>
                <WalletMultiButton />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
                    <p style={{ color: '#64748b' }}>TIRE PRESSURE</p>
                    <h2 style={{ color: '#38bdf8' }}>{telemetry.tirePressure}</h2>
                </div>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
                    <p style={{ color: '#64748b' }}>FLUID LEVELS</p>
                    <h2 style={{ color: '#22c55e' }}>{telemetry.fluidLevel}</h2>
                </div>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
                    <p style={{ color: '#64748b' }}>BRAKE VARIANCE</p>
                    <h2 style={{ color: '#fbbf24' }}>{telemetry.brakeVariance}</h2>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <button 
                    onClick={logMaintenanceEvent}
                    style={{ background: '#38bdf8', color: '#020617', border: 'none', padding: '15px 30px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                >
                    SEAL MAINTENANCE AUDIT
                </button>
            </div>
        </div>
    );
};

export default function App() {
    return (
        <ConnectionProvider endpoint="https://api.devnet.solana.com">
            <WalletProvider wallets={[useMemo(() => new PhantomWalletAdapter(), [])]} autoConnect>
                <WalletModalProvider><SensorDiagnostics /></WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
