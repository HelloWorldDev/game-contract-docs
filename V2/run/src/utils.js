import { getSimulationComputeUnits } from "@solana-developers/helpers";
import { ComputeBudgetProgram, Keypair, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import fs from "fs";
import resolve from "resolve-dir";

const confirmOptions = {
    skipPreflight: true,
};

export function loadKeypair(jsonPath) {
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(resolve(jsonPath)).toString())));
}

export function loadProgramIdl(filepath) {
    return JSON.parse(fs.readFileSync(resolve(filepath), "utf-8"));
}

export async function buildOptimalTransaction({ connection, instructions, payer, lookupTables }) {
    const [microLamports, units, recentBlockhash] = await Promise.all([
        100,
        await getSimulationComputeUnits(connection, instructions, payer, lookupTables).then((units) => {
            if (units) {
                return units + 1000;
            } else {
                return 20000;
            }
        }),
        await connection.getLatestBlockhash(),
    ]);

    instructions.unshift(ComputeBudgetProgram.setComputeUnitPrice({ microLamports }));
    if (units) {
        instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
    }
    return {
        transaction: new VersionedTransaction(
            new TransactionMessage({
                instructions,
                recentBlockhash: recentBlockhash.blockhash,
                payerKey: payer,
            }).compileToV0Message(lookupTables)
        ),
        recentBlockhash,
    };
}

export async function sendAndConfirmOptimalTransaction({ connection, ixs, payer, otherSigners = [] }) {
    let txResult = await buildOptimalTransaction({
        connection,
        instructions: ixs,
        payer: payer.publicKey,
        lookupTables: [],
    });

    txResult.transaction.sign([payer]);

    if (otherSigners) {
        txResult.transaction.sign(otherSigners);
    }

    let txsig = await connection.sendTransaction(txResult.transaction, confirmOptions);

    await connection.confirmTransaction(
        {
            blockhash: txResult.recentBlockhash.blockhash,
            lastValidBlockHeight: txResult.recentBlockhash.lastValidBlockHeight,
            signature: txsig,
        },
        "confirmed"
    );

    return txsig;
}
