import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { createMintToInstruction, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { readFileSync } from 'fs';
import * as anchor from '@coral-xyz/anchor';

// 1. Configuration
const PROGRAM_ID = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F");
const AETHERIUM_MINT = new PublicKey("7xWW6CUX9Y83UAveEuKWDbtxEaYmwHJrhK7xGQP8eG5F"); // Aetherium Token
const RPC_URL = "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

// 2. Load the Protocol Authority (Your local CLI keypair)
const secretKey = JSON.parse(readFileSync('/home/aetherium/.config/solana/id.json', 'utf8'));
const authority = Keypair.fromSecretKey(Uint8Array.from(secretKey));

console.log("--------------------------------------------------");
console.log("AETHERIUM PROTOCOL | REWARDER SERVICE ACTIVE");
console.log(`Authority: ${authority.publicKey.toBase58()}`);
console.log("--------------------------------------------------");

// 3. Listen for Program Logs
connection.onLogs(PROGRAM_ID, async (logs, ctx) => {
    // Check if the transaction contains a "SIT_REGISTRY" event
    const isRegistryEvent = logs.logs.some(line => line.includes("SIT_REGISTRY"));
    
    if (isRegistryEvent) {
        console.log(`[EVENT] New Hardware Registration Detected in Signature: ${logs.signature}`);
        
        try {
            // Identify the Asset Owner from the transaction details
            const tx = await connection.getParsedTransaction(logs.signature, { maxSupportedTransactionVersion: 0 });
            const owner = tx.transaction.message.accountKeys[0].pubkey; // Assuming first account is the author

            console.log(`[ACTION] Minting 5 $AETHERIUM Rewards to Node: ${owner.toBase58()}`);

            const ata = await getAssociatedTokenAddress(AETHERIUM_MINT, owner, false, TOKEN_2022_PROGRAM_ID);
            const rewardIx = createMintToInstruction(
                AETHERIUM_MINT,
                ata,
                authority.publicKey,
                5 * 10**9, // 5 Aetherium tokens
                [],
                TOKEN_2022_PROGRAM_ID
            );

            const { blockhash } = await connection.getLatestBlockhash();
            const transaction = new anchor.web3.Transaction().add(rewardIx);
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = authority.publicKey;
            
            transaction.sign(authority);
            const sig = await connection.sendRawTransaction(transaction.serialize());
            console.log(`[SUCCESS] Reward Issued. Sig: ${sig}`);

        } catch (err) {
            console.error(`[ERROR] Reward Issuance Failed: ${err.message}`);
        }
    }
}, "confirmed");
