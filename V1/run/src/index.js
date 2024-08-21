import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { loadKeypair, sendAndConfirmOptimalTransaction } from "./utils.js";
import { PROGRAM_ID, buyIx, createIx, sellIx } from "./new-pump-ft.js";
import NewPumpIDL from "../target/idl/new_pump.json";
import BN from "bn.js";

async function main() {
    const endpoint = "https://api.devnet.solana.com";
    const connection = new Connection(endpoint, "confirmed");
    // 本地账户
    const owner = loadKeypair("../config/user.json");
    const wallet = new anchor.Wallet(owner);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);
    const newPumpProgramId = new PublicKey(PROGRAM_ID);
    const newPumpFunProgram = new anchor.Program(NewPumpIDL, newPumpProgramId, provider);
    // 账户：签名/支付，看本地情况更改
    const user = loadKeypair("../config/user.json");
    const mint = new Keypair();

    let ix;
    let ix1;
    let ix2;
    let txSig;

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
