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

//The amount of sols entered during purchase corresponds to how many current coins can be purchased (including handling fees)
//inputValue is the number of coins entered in the input
export function calSol2Token(token_supply, sol_balance, inputValue) {
    let current_supply = token_supply;
    let current_sol_balance = sol_balance;
    let buy_amount_lamports = numToString(new BigNumber(inputValue * 0.99).times(1e9).dp(0, BigNumber.ROUND_DOWN));
    let m = 30000000000;
    let p = Number(current_sol_balance) + Number(buy_amount_lamports);
    let n = 1073000000000000;
    let np = n * p;
    let m_plus_p = Number(m) + Number(p);
    let tokens_bought = numToString(new BigNumber(Number(np / m_plus_p) - Number(current_supply)).div(1e6));
    return tokens_bought;
}

//The current amount of coins entered when selling corresponds to how many sols can be sold (including handling fees)
//inputValue is the number of coins entered in the input
export function calToken2Sol(token_supply, sol_balance, inputValue) {
    let current_supply = token_supply;
    let current_sol_balance = sol_balance;
    let buy_amount_lamports = numToString(new BigNumber(inputValue).times(1e6).dp(0, BigNumber.ROUND_DOWN));
    let k = Number(current_supply) - Number(buy_amount_lamports);
    let m = 30000000000;
    let n = 1073000000000000;
    let km = k * m;
    let n_minus_k = Number(n) - Number(k);
    let lamports_received = numToString(new BigNumber(Number(current_sol_balance) - Number(km / n_minus_k)).div(1e9));
    return lamports_received * 0.99;
}

export const numToString = (num) => {
    let m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || "").length - m[2]));
};
