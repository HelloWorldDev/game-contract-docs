# V2 Contract Usage Documentation

## Project Name

Game.com

## Catalog

1. [Introduction](#Introduction)
2. [Installation](#Installation)
    - [Prerequisites](#Prerequisites)
3. [LocalUsage](#LocalUsage)
    - [Initialization](#Initialization)
    - [CreateToken](#CreateToken)
    - [Buy](#Buy)
    - [Sell](#Sell)

## Introduction

Game.com v2 is an enhanced version of the first Game.com project, based on the Solana blockchain. It aims to facilitate the creation and trading of tokens through smart contracts and liquidity pools. This document provides detailed instructions for installing and using the project.

```typescript
// mainnet/testnet NEW GAME Program ID
const MAINNET_PROGRAM_ID = "GamE4YGnRbnH3cMGY34cw9E9BaxoPYc4pNXiAciG2hEy";

// mainnet/testnet TOKEN_METADATA_PROGRAM_ID
const NEWGAME_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

// mainnet FEE_RECIPIENT
const MAINNET_FEE_RECIPIENT = "6i8r7uZwqVyyhv1g1gm7yPdTGtuT21yofGVxHXi4aWM4";
// testnet FEE_RECIPIENT
const TESTNET_FEE_RECIPIENT = "GnpaTWNTiK8HnBEzg9onjHkJvkqw3A7Jm86NXeUcU1M5";

// IDL: See ==> /target/idl/new_pump.json

// Calculate bid and ask prices: See ==> /run/conversion.js

// Supported quotes: See ==> /run/constant/quote.js
// mainnet
export const SOL = "So11111111111111111111111111111111111111112";
export const BAZINGA = "C3JX9TWLqHKmcoTDTppaJebX2U7DcUQDEHVSmJFz6K6S";
export const BOME = "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82";
export const EGGY = "6xtdB32yaaUfmdoHjPBZCBkN8rfjipFGJcSfeqbzpump";
export const $WIF = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";

// testnet
...

```

## Installation

### Prerequisites

-   **Node.js v18.x.x**

    -   Supports only Node.js version 18 and its subversions. Versions 19 or higher may encounter issues.
    -   Check version: `node -v`
    -   Install specific version:

        ```sh
        # Use nvm (Node Version Manager) to install a specific version
        nvm install 18
        nvm use 18
        ```

    -   Installation link: [Node.js](https://nodejs.org/en/download/package-manager)

-   **Anchor v0.29.0**
    -   Check version: `anchor --version`
    -   Installation command:
        ```sh
        cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
        avm install 0.29.0
        ```
    -   Installation link: [Anchor](https://www.anchor-lang.com/docs/installation)

## LocalUsage

### Initialization

Before using contract methods, initialization is required:

Note: Please customize according to your situation!!!!!!!!!!!

```typescript
const endpoint = "https://api.devnet.solana.com";
const connection = new Connection(endpoint, "confirmed");
const owner = loadKeypair("~/.config/solana/id.json");
const wallet = new anchor.Wallet(owner);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
anchor.setProvider(provider);
const newPumpProgramId = new PublicKey("GameEs6zXFFGhE5zCdx2sqeRZkL7uYzPsZuSVn1fdxHF");
const newPumpFunProgram: anchor.Program<NewPump> = new anchor.Program(NewPumpIDL, newPumpProgramId, provider);
```

1. Create a `Connection` instance. You can change the `endpoint` to test different nodes.
2. `owner` refers to the default local Solana wallet.
3. Create the anchor provider and program instances, adjusting the IDL interface file path as needed.

### CreateToken

How to Create Token:

```typescript
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
): Promise<TransactionInstruction>{
    ...
};
```

Note: Creating a token involves two modes—Automatic Launch and Manual Launch — requiring different parameters.

Please take note of the differences:
initVirtualQuoteReserves / initVirtualBaseReserves / isLaunchPermitted

```typescript
// Automatic Launch: isLaunchPermitted: true
ix = await createIx(newPumpFunProgram, user.publicKey, quote_mint, mint.publicKey, fee_recipient, {
    name: "Ansem Vs Tate",
    symbol: "BOX",
    uri: "https://cf-ipfs.com/ipfs/QmbUBYQ6vg3q2a4P93SGAkAbyn9p6aZ91V8Ly6UjM87rmW",
    supply: new BN(100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))),
    target: new BN(85 * Math.pow(10, 9)),
    initVirtualQuoteReserves: new BN(0.352941 * 85000000000), // Automatic Launch
    initVirtualBaseReserves: new BN(1.073 * 100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))),
    feeBps: new BN(100),
    createFee: new BN(2 * LAMPORTS_PER_SOL),
    isLaunchPermitted: true,
});

// Manual Launch: isLaunchPermitted: false
ix = await createIx(newPumpFunProgram, user.publicKey, quote_mint, mint.publicKey, fee_recipient, {
    name: "Ansem Vs Tate",
    symbol: "BOX",
    uri: "https://cf-ipfs.com/ipfs/QmbUBYQ6vg3q2a4P93SGAkAbyn9p6aZ91V8Ly6UjM87rmW",
    supply: new BN(100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))),
    target: new BN(85 * Math.pow(10, 9)),
    initVirtualQuoteReserves: new BN(0.352941 * 0.8 * 85000000000), //Manual Launch
    initVirtualBaseReserves: new BN(1 * 100 * Math.pow(10, 9)).mul(new BN(Math.pow(10, 6))), //Manual Launch
    feeBps: new BN(100),
    createFee: new BN(2 * LAMPORTS_PER_SOL),
    isLaunchPermitted: false,
});
```

`createIx` Parameter Description:

-   `program`: Program instance.
-   `user`: User PublicKey.
-   `quoteMint`: Mint address of the quote token, which must be a valid added quote token.
-   `baseMint`: Mint address of the base token.
-   `feeRecipient`: Address for receiving fees.
-   `args`: Token parameters.

Args Description:

-   `name`、`symbol` 和 `uri`: Basic information of the token.
-   `supply`: Token supply, constrained by `baseMinSupply` and `baseMaxSupply`.
-   `target`：Required quantity of quote tokens in the bonding curve.
-   `initVirtualQuoteReserves` and `initVirtualBaseReserves`: Initial values for the bonding curve accumulation formula.
-   `feeBps`: Transaction fee per trade, measured in basis points (1% to 50%).
-   `createFee`: Fee required for creating the token, can be zero.
-   `isLaunchPermitted`: Controls whether the token is automatically launched. `true` for Automatic Launch, `false` for Manual Launch.

### Buy

How to Buy:

```typescript
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
  ...
}
```

`buyIx` Parameter Description:

-   `program`: Program instance.
-   `user`: User PublicKey.
-   `quoteMint`: Mint address of the quote token. It must be a valid quote token.
-   `baseMint`: Mint address of the base token.
-   `feeRecipient`: Address for receiving fees.
-   `args`: Token parameters.

Args Description:

-   `quoteCost`: The amount of quote tokens the user is willing to spend.
-   `minBaseAmount`: The minimum amount of base tokens the user expects to receive.

### Sell

How to Sell:

```typescript
interface SellArgs {
  baseCost: BN;
  minQuoteAmount: BN;
}
export function sellIx(
  program: Program<NewPump2>,
  user: PublicKey,
  quoteMint: PublicKey,
  baseMint: PublicKey,
  args: SellArgs
): Promise<TransactionInstruction> {
    ...
}
```

`sellIx` Parameter Description:

-   `program`: Program instance.
-   `user`: User PublicKey.
-   `quoteMint`: Mint address of the quote token. It must be a valid quote token.
-   `baseMint`: Mint address of the base token.
-   `feeRecipient`: Address for receiving fees.
-   `args`: Token parameters.

Args Description:

-   `baseCost`: The amount of base tokens the user is willing to sell.
-   `minQuoteAmount`: The minimum amount of quote tokens the user expects to receive.
