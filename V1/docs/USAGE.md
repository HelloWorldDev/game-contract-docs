# V1 Contract Usage Documentation

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

Game.com is an enhanced and optimized meme coin launch platform.

```typescript
// mainnet/testnet NEW GAME Program ID
const MAINNET_PROGRAM_ID = "GameEs6zXFFGhE5zCdx2sqeRZkL7uYzPsZuSVn1fdxHF";

// mainnet/testnet TOKEN_METADATA_PROGRAM_ID
export const NEWGAME_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

// IDL: See ==> /target/idl/new_pump.json
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
```

`createIx` is a wrapper for calling the contract `create` instruction.
`newPumpFunProgram` is the program instance.
which receives token information{}:
`name` (Token name)
`symbol` (Token symbol)
`uri` (off-chain data address).
`user.publicKey` is the user's PublicKey.
`mint.publicKey` is the mint PublicKey.

### Buy

How to Buy:

```typescript
ix = await buyIx(
    newPumpFunProgram,
    {
        solCost: new BN(1 * LAMPORTS_PER_SOL),
        minTokenAmount: new BN(0),
    },
    user.publicKey,
    mint.publicKey
);
```

`buyIx` is a wrapper for calling the contract `buy` instruction.
`newPumpFunProgram` is the program instance.
`solCost` represents the amount of SOL spent by the user, including fees.
`minTokenAmount` is the minimum amount of tokens expected, which depends on frontend simulation and user-selected slippage; 0 is used here for simplicity.
`user.publicKey` is the user's PublicKey.
`mint.publicKey` is the mint PublicKey.

### Sell

How to Sell:

```typescript
ix = await sellIx(
    newPumpFunProgram,
    {
        tokenCost: new BN(39016297.314964 * Math.pow(10, 6)),
        minSolAmount: new BN(0),
    },
    user.publicKey,
    mint.publicKey
);
```

`sellIx` is a wrapper for calling the contract `sell` instruction. `newPumpFunProgram` is the program instance.
`tokenCost` represents the amount of tokens sold by the user. `minSolAmount` is the minimum amount of SOL received, which depends on frontend simulation and user-selected slippage; 0 is used here for simplicity.
`user.publicKey` is the user's PublicKey.
`mint.publicKey` is the mint PublicKey.
