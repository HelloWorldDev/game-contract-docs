import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { NewPump2 } from "../../target/types/new_pump";
import { Program } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import BN from "bn.js";

export const PROGRAM_ID = new PublicKey("GamE4YGnRbnH3cMGY34cw9E9BaxoPYc4pNXiAciG2hEy");

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const programConfigPdaAddress = (programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("program_config")], programId)[0];

export const feeRecipientPdaAddress = (programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("fee_recipient")], programId)[0];

export const quoteTokenInfoPdaAddress = (quoteMint: PublicKey, programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("quote_token_info"), quoteMint.toBuffer()], programId)[0];

export const feeRecipientQuotePdaAddress = (quoteMint: PublicKey, programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("fee_recipient_quote"), quoteMint.toBuffer()], programId)[0];

export const metadataPdaAddress = (mint: PublicKey, tokenMetadataProgramId: PublicKey = TOKEN_METADATA_PROGRAM_ID) =>
    PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), tokenMetadataProgramId.toBuffer(), mint.toBuffer()],
        tokenMetadataProgramId
    )[0];

export const bondingCurvePdaAddress = (quoteMint: PublicKey, baseMint: PublicKey, programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("bonding_curve"), quoteMint.toBuffer(), baseMint.toBuffer()], programId)[0];

export const bondingCurveQuotePdaAddress = (bondingCurve: PublicKey, programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("bonding_curve_quote"), bondingCurve.toBuffer()], programId)[0];

export const bondingCurveBasePdaAddress = (bondingCurve: PublicKey, programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("bonding_curve_base"), bondingCurve.toBuffer()], programId)[0];

export const eventAuthorityPdaAddress = (programId: PublicKey = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("__event_authority")], programId)[0];

interface CreateArgs {
    name: string;
    symbol: string;
    uri: string;
    supply: BN;
    target: BN;
    initVirtualQuoteReserves: BN;
    initVirtualBaseReserves: BN;
    feeBps: BN;
    createFee: BN;
    isLaunchPermitted: boolean;
}
export function createIx(
    program: Program<NewPump2>,
    user: PublicKey,
    quoteMint: PublicKey,
    baseMint: PublicKey,
    feeRecipient: PublicKey,
    args: CreateArgs
): Promise<TransactionInstruction> {
    const bondingCurve = bondingCurvePdaAddress(quoteMint, baseMint);
    return program.methods
        .create(args)
        .accountsStrict({
            user,
            programConfig: programConfigPdaAddress(),
            feeRecipient: feeRecipient,
            quoteMint,
            baseMint,
            metadata: metadataPdaAddress(baseMint),
            bondingCurve,
            bondingCurveQuote: bondingCurveQuotePdaAddress(bondingCurve),
            bondingCurveBase: bondingCurveBasePdaAddress(bondingCurve),
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            eventAuthority: eventAuthorityPdaAddress(),
            program: PROGRAM_ID,
        })
        .instruction();
}

interface BuyArgs {
    quoteCost: BN;
    minBaseAmount: BN;
}
export function buyIx(
    program: Program<NewPump2>,
    user: PublicKey,
    quoteMint: PublicKey,
    baseMint: PublicKey,
    feeRecipient: PublicKey,
    args: BuyArgs
): Promise<TransactionInstruction> {
    const bondingCurve = bondingCurvePdaAddress(quoteMint, baseMint);
    return program.methods
        .buy(args)
        .accountsStrict({
            user,
            quoteMint,
            programConfig: programConfigPdaAddress(),
            feeRecipientAccount: feeRecipient,
            feeRecipientQuote: getAssociatedTokenAddressSync(quoteMint, feeRecipient),
            baseMint,
            bondingCurve,
            bondingCurveQuote: bondingCurveQuotePdaAddress(bondingCurve),
            bondingCurveBase: bondingCurveBasePdaAddress(bondingCurve),
            userQuoteAccount: getAssociatedTokenAddressSync(quoteMint, user),
            userBaseAccount: getAssociatedTokenAddressSync(baseMint, user),
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            eventAuthority: eventAuthorityPdaAddress(),
            program: PROGRAM_ID,
        })
        .instruction();
}

interface SellArgs {
    baseCost: BN;
    minQuoteAmount: BN;
}
export function sellIx(
    program: Program<NewPump2>,
    user: PublicKey,
    quoteMint: PublicKey,
    baseMint: PublicKey,
    feeRecipient: PublicKey,
    args: SellArgs
): Promise<TransactionInstruction> {
    const bondingCurve = bondingCurvePdaAddress(quoteMint, baseMint);
    return program.methods
        .sell(args)
        .accountsStrict({
            user,
            quoteMint,
            programConfig: programConfigPdaAddress(),
            feeRecipientAccount: feeRecipient,
            feeRecipientQuote: getAssociatedTokenAddressSync(quoteMint, feeRecipient),
            baseMint,
            bondingCurve,
            bondingCurveQuote: bondingCurveQuotePdaAddress(bondingCurve),
            bondingCurveBase: bondingCurveBasePdaAddress(bondingCurve),
            userQuoteAccount: getAssociatedTokenAddressSync(quoteMint, user),
            userBaseAccount: getAssociatedTokenAddressSync(baseMint, user),
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            eventAuthority: eventAuthorityPdaAddress(),
            program: PROGRAM_ID,
        })
        .instruction();
}
