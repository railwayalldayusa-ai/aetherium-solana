import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';

// Load IDL manually since we are in an ES module
const idl = JSON.parse(readFileSync('./src/idl.json', 'utf8'));
const PROGRAM_ID = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function auditFleet() {
    console.log("--------------------------------------------------");
    console.log("AETHERIUM PROTOCOL | SIT MINT AUDIT REPORT");
    console.log("--------------------------------------------------");
    
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    const coder = new anchor.BorshAccountsCoder(idl);
    
    const fleetData = accounts.map(account => {
        try {
            const decoded = coder.decode("Message", account.account.data);
            return {
                SIT_Mint: account.pubkey.toBase58().slice(0, 8) + "...",
                Asset_Owner: decoded.author.toBase58().slice(0, 8) + "...",
                Telemetry: decoded.content,
                Timestamp: new Date(decoded.timestamp * 1000).toLocaleString()
            };
        } catch (e) { return null; }
    }).filter(a => a !== null);

    console.table(fleetData);
    console.log(`Total Verified SIT Assets on Ledger: ${fleetData.length}`);
}

auditFleet();
