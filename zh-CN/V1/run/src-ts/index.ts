import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, TransactionInstruction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { loadKeypair, sendAndConfirmOptimalTransaction } from "./utils";
import { NewPump } from "../../target/types/new_pump";
import { PROGRAM_ID, buyIx, createIx, sellIx } from "./new-pump-ft";
import NewPumpIDL from "../target/idl/new_pump.json";
import BN from "bn.js";

async function main() {
    const endpoint = "https://api.devnet.solana.com";
    const connection = new Connection(endpoint, "confirmed");
    const owner = loadKeypair("~/.config/solana/id.json");
    const wallet = new anchor.Wallet(owner);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);
    const newPumpProgramId = new PublicKey(PROGRAM_ID);
    const newPumpFunProgram: anchor.Program<NewPump> = new anchor.Program(NewPumpIDL, newPumpProgramId, provider);

    const user = loadKeypair("../keys/user.json");
    const mint = new Keypair();

    let ix: TransactionInstruction;
    let ix1: TransactionInstruction;
    let ix2: TransactionInstruction;
    let txSig: string;

    // Create
    ix = await createIx(
        newPumpFunProgram,
        {
            name: "Ansem Vs Tate",
            symbol: "BOX",
            uri: "https://cf-ipfs.com/ipfs/QmbUBYQ6vg3q2a4P93SGAkAbyn9p6aZ91V8Ly6UjM87rmW",
        },
        user.publicKey,
        mint.publicKey
    );
    txSig = await sendAndConfirmOptimalTransaction({
        connection,
        ixs: [ix],
        payer: user,
        otherSigners: [mint],
    });
    console.log("Create tx: ", txSig);

    // Buy
    ix = await buyIx(
        newPumpFunProgram,
        {
            solCost: new BN(1 * LAMPORTS_PER_SOL),
            minTokenAmount: new BN(0),
        },
        user.publicKey,
        mint.publicKey
    );
    txSig = await sendAndConfirmOptimalTransaction({
        connection,
        ixs: [ix],
        payer: user,
    });
    console.log("Buy tx: ", txSig);

    // Sell
    ix = await sellIx(
        newPumpFunProgram,
        {
            tokenCost: new BN(32_449_596_774_194),
            minSolAmount: new BN(0),
        },
        user.publicKey,
        mint.publicKey
    );
    txSig = await sendAndConfirmOptimalTransaction({
        connection,
        ixs: [ix],
        payer: user,
    });
    console.log("Sell tx: ", txSig);

    // Buy
    ix1 = await buyIx(
        newPumpFunProgram,
        {
            solCost: new BN(1 * LAMPORTS_PER_SOL),
            minTokenAmount: new BN(0),
        },
        user.publicKey,
        mint.publicKey
    );
    // Sell
    ix2 = await sellIx(
        newPumpFunProgram,
        {
            tokenCost: new BN(32_449_596_774_194),
            minSolAmount: new BN(0),
        },
        user.publicKey,
        mint.publicKey
    );
    txSig = await sendAndConfirmOptimalTransaction({
        connection,
        ixs: [ix1, ix2],
        payer: user,
    });
    console.log("buy&&Sell tx: ", txSig);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
