import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { NewPump } from "../../target/types/new_pump";
import { Program } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import BN from "bn.js";

export const PROGRAM_ID = new PublicKey("GameEs6zXFFGhE5zCdx2sqeRZkL7uYzPsZuSVn1fdxHF");

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const feeRecipientPdaAddress = (programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("fee_recipient")], programId)[0];

export const metadataPdaAddress = (mint: PublicKey, tokenMetadataProgramId: PublicKey = TOKEN_METADATA_PROGRAM_ID) =>
    PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), tokenMetadataProgramId.toBuffer(), mint.toBuffer()],
        tokenMetadataProgramId
    )[0];

export const bondingCurvePdaAddress = (mint: PublicKey, programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([mint.toBuffer(), Buffer.from("bonding_curve")], programId)[0];

export const GlobalStatePdaAddress = (programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("global_state")], programId)[0];

export const bondingCurveTokenPdaAddress = (mint: PublicKey, programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([mint.toBuffer(), Buffer.from("bonding_curve_token")], programId)[0];

export const eventAuthorityPdaAddress = (programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("__event_authority")], programId)[0];

interface CreateArgs {
    name: string;
    symbol: string;
    uri: string;
}
export function createIx(
    program: Program<NewPump>,
    args: CreateArgs,
    user: PublicKey,
    mint: PublicKey
): Promise<TransactionInstruction> {
    return program.methods
        .create(args)
        .accountsStrict({
            user: user,
            mint: mint,
            metadata: metadataPdaAddress(mint),
            bondingCurve: bondingCurvePdaAddress(mint),
            bondingCurveToken: bondingCurveTokenPdaAddress(mint),
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            eventAuthority: eventAuthorityPdaAddress(),
            program: PROGRAM_ID,
        })
        .instruction();
}

interface BuyArgs {
    solCost: BN;
    minTokenAmount: BN;
}
export function buyIx(
    program: Program<NewPump>,
    args: BuyArgs,
    user: PublicKey,
    mint: PublicKey
): Promise<TransactionInstruction> {
    return program.methods
        .buy(args)
        .accountsStrict({
            user: user,
            feeRecipient: feeRecipientPdaAddress(),
            mint: mint,
            globalState: GlobalStatePdaAddress(),
            bondingCurve: bondingCurvePdaAddress(mint),
            bondingCurveToken: bondingCurveTokenPdaAddress(mint),
            userToken: getAssociatedTokenAddressSync(mint, user),
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            eventAuthority: eventAuthorityPdaAddress(),
            program: PROGRAM_ID,
        })
        .instruction();
}

interface SellArgs {
    tokenCost: BN;
    minSolAmount: BN;
}
export function sellIx(
    program: Program<NewPump>,
    args: SellArgs,
    user: PublicKey,
    mint: PublicKey
): Promise<TransactionInstruction> {
    return program.methods
        .sell(args)
        .accountsStrict({
            user: user,
            feeRecipient: feeRecipientPdaAddress(),
            mint: mint,
            globalState: GlobalStatePdaAddress(),
            bondingCurve: bondingCurvePdaAddress(mint),
            bondingCurveToken: bondingCurveTokenPdaAddress(mint),
            userToken: getAssociatedTokenAddressSync(mint, user),
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            eventAuthority: eventAuthorityPdaAddress(),
            program: PROGRAM_ID,
        })
        .instruction();
}
