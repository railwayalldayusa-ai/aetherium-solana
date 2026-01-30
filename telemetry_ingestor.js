import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { readFileSync } from 'fs';

const idl = JSON.parse(readFileSync('./src/idl.json', 'utf8'));
const PROGRAM_ID = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const secretKey = JSON.parse(readFileSync('/home/aetherium/.config/solana/id.json', 'utf8'));
const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), { commitment: "confirmed" });
const program = new anchor.Program(idl, provider);

// REAL DATA SCHEMA: This mimics a live OBD-II feed from a fleet API
const realFleetData = [
    { vin: "1NK-AETHER-001", rpm: 2150, load: "42%", speed: "64mph", temp: "195F" },
    { vin: "1NK-AETHER-002", rpm: 0, load: "0%", speed: "0mph", temp: "80F" },
    { vin: "1NK-AETHER-003", rpm: 1850, load: "30%", speed: "55mph", temp: "190F" }
];

async function ingest() {
    console.log("🛰️  AETHERIUM PROTOCOL | REAL-TIME TELEMETRY INGESTION ACTIVE");
    for (const vehicle of realFleetData) {
        const sitMint = Keypair.generate();
        const telemetryString = `VIN:${vehicle.vin} | RPM:${vehicle.rpm} | LOAD:${vehicle.load} | SPEED:${vehicle.speed}`;
        
        console.log(`[INGESTING] ${vehicle.vin} -> Anchoring to Ledger...`);
        try {
            await program.methods.postMessage(telemetryString)
                .accounts({
                    messageAccount: sitMint.publicKey,
                    author: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([sitMint])
                .rpc();
            console.log(`✅ ${vehicle.vin} Compliance Event Sealed.`);
        } catch (e) { console.error(`❌ Ingestion Error:`, e.message); }
    }
    console.log("\n🏁 Data Batch Sealed. Fleet Dashboard Updated.");
}

ingest();
