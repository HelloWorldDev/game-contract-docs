import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";

export const PROGRAM_ID = new PublicKey("GamE4YGnRbnH3cMGY34cw9E9BaxoPYc4pNXiAciG2hEy");

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const programConfigPdaAddress = (programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("program_config")], programId)[0];

export const feeRecipientPdaAddress = (programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("fee_recipient")], programId)[0];

export const quoteTokenInfoPdaAddress = (quoteMint, programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("quote_token_info"), quoteMint.toBuffer()], programId)[0];

export const feeRecipientQuotePdaAddress = (quoteMint, programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("fee_recipient_quote"), quoteMint.toBuffer()], programId)[0];

export const metadataPdaAddress = (mint, tokenMetadataProgramId = TOKEN_METADATA_PROGRAM_ID) =>
    PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), tokenMetadataProgramId.toBuffer(), mint.toBuffer()],
        tokenMetadataProgramId
    )[0];

export const bondingCurvePdaAddress = (quoteMint, baseMint, programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("bonding_curve"), quoteMint.toBuffer(), baseMint.toBuffer()], programId)[0];

export const bondingCurveQuotePdaAddress = (bondingCurve, programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("bonding_curve_quote"), bondingCurve.toBuffer()], programId)[0];

export const bondingCurveBasePdaAddress = (bondingCurve, programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("bonding_curve_base"), bondingCurve.toBuffer()], programId)[0];

export const eventAuthorityPdaAddress = (programId = PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([Buffer.from("__event_authority")], programId)[0];

export function createIx(program, user, quoteMint, baseMint, feeRecipient, args) {
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

export function buyIx(program, user, quoteMint, baseMint, feeRecipient, args) {
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

export function sellIx(program, user, quoteMint, baseMint, feeRecipient, args) {
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
