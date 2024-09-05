import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, TransactionInstruction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { loadKeypair, sendAndConfirmOptimalTransaction } from "./utils";
import { NewPump } from "../../target/types/new_pump";
import { PROGRAM_ID, buyIx, createIx, sellIx } from "./new-pump-ft";
import NewPumpIDL from "../target/idl/new_pump.json";
import BN from "bn.js";
import { SOL } from "../constant/quote.js";
import { MAINNET_FEE_RECIPIENT } from "../constant/feeRecipient.js";

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
    const quote_mint = new PublicKey(SOL);
    const fee_recipient = new PublicKey(MAINNET_FEE_RECIPIENT);

    let ix: TransactionInstruction;
    let ix1: TransactionInstruction;
    let ix2: TransactionInstruction;
    let txSig: string;

    // Create：⚠️两种模式，参数不同！
    // 自动发射
    ix = await createIx(newPumpFunProgram, user.publicKey, quote_mint, mint.publicKey, fee_recipient, {
        name: "Ansem Vs Tate",
        symbol: "BOX",
        uri: "https://cf-ipfs.com/ipfs/QmbUBYQ6vg3q2a4P93SGAkAbyn9p6aZ91V8Ly6UjM87rmW",
        supply: new BN(100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))),
        target: new BN(85 * Math.pow(10, 9)),
        initVirtualQuoteReserves: new BN(0.352941 * 85000000000), //自动发射
        initVirtualBaseReserves: new BN(1.073 * 100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))),
        feeBps: new BN(100),
        createFee: new BN(2 * LAMPORTS_PER_SOL),
        isLaunchPermitted: true,
    });

    // 手动发射
    ix = await createIx(newPumpFunProgram, user.publicKey, quote_mint, mint.publicKey, fee_recipient, {
        name: "Ansem Vs Tate",
        symbol: "BOX",
        uri: "https://cf-ipfs.com/ipfs/QmbUBYQ6vg3q2a4P93SGAkAbyn9p6aZ91V8Ly6UjM87rmW",
        supply: new BN(100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))),
        target: new BN(85 * Math.pow(10, 9)),
        initVirtualQuoteReserves: new BN(0.352941 * 0.8 * 85000000000), //手动发射发射
        initVirtualBaseReserves: new BN(1 * 100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))), //手动发射发射
        feeBps: new BN(100),
        createFee: new BN(2 * LAMPORTS_PER_SOL),
        isLaunchPermitted: false,
    });

    txSig = await sendAndConfirmOptimalTransaction({
        connection,
        ixs: [ix],
        payer: user,
        otherSigners: [mint],
    });
    console.log("Create tx: ", txSig);

    // Buy
    ix1 = await buyIx(newPumpFunProgram, user.publicKey, quote_mint, mint.publicKey, fee_recipient, {
        quoteCost: new BN(1 * LAMPORTS_PER_SOL),
        minBaseAmount: new BN(0),
    });

    txSig = await sendAndConfirmOptimalTransaction({
        connection,
        ixs: [ix1],
        payer: user,
    });
    console.log("Buy tx: ", txSig);

    // Sell
    ix2 = await sellIx(newPumpFunProgram, user.publicKey, quote_mint, mint.publicKey, fee_recipient, {
        baseCost: new BN(1 * LAMPORTS_PER_SOL),
        minQuoteAmount: new BN(0),
    });

    txSig = await sendAndConfirmOptimalTransaction({
        connection,
        ixs: [ix2],
        payer: user,
    });
    console.log("Sell tx: ", txSig);

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
