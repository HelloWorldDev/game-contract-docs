# V2 合约使用文档

## 项目名称

Game.com

## 目录

1. [简介](#简介)
2. [安装](#安装)
    - [前提条件](#前提条件)
3. [local 使用方法](#local-使用方法)
    - [初始化](#初始化)
    - [创建代币](#创建代币)
    - [买](#买)
    - [卖](#卖)

## 简介

Game.com v2 版本 是一个基于 Solana 区块链的项目，是基于 Game.com 第一个版本的提升，旨在通过智能合约和流动性池实现代币的创建、买卖。本文档详细介绍了该项目的安装和使用方法。

```typescript
// mainnet/testnet NEW GAME Program ID
const MAINNET_PROGRAM_ID = "GamE4YGnRbnH3cMGY34cw9E9BaxoPYc4pNXiAciG2hEy";

// mainnet/testnet TOKEN_METADATA_PROGRAM_ID
const NEWGAME_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

// mainnet FEE_RECIPIENT
const MAINNET_FEE_RECIPIENT = "6i8r7uZwqVyyhv1g1gm7yPdTGtuT21yofGVxHXi4aWM4";
// testnet FEE_RECIPIENT
const TESTNET_FEE_RECIPIENT = "GnpaTWNTiK8HnBEzg9onjHkJvkqw3A7Jm86NXeUcU1M5";

// IDL：详见/target/idl/new_pump.json

// 计算买卖报价：详见 ==> /run/conversion.js

// 支持的quote：详见/run/constant/quote.js
// mainnet
export const SOL = "So11111111111111111111111111111111111111112";
export const BAZINGA = "C3JX9TWLqHKmcoTDTppaJebX2U7DcUQDEHVSmJFz6K6S";
export const BOME = "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82";
export const EGGY = "6xtdB32yaaUfmdoHjPBZCBkN8rfjipFGJcSfeqbzpump";
export const $WIF = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";

// testnet
...

```

## 安装

### 前提条件

-   **Node.js v18.x.x**

    -   仅支持 Node.js 18 版本及其子版本， 19 或更高版本运行可能有问题。
    -   检查版本：`node -v`
    -   安装指定版本：

        ```sh
        # 使用 nvm（Node Version Manager）来安装特定版本
        nvm install 18
        nvm use 18
        ```

    -   安装链接：[Node.js](https://nodejs.org/en/download/package-manager)

-   **Anchor v0.29.0**
    -   检查版本：`anchor --version`
    -   安装命令：
        ```sh
        cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
        avm install 0.29.0
        ```
    -   安装链接：[Anchor](https://www.anchor-lang.com/docs/installation)

## local 使用方法

### 初始化

在使用合约方法之前，需要先进行初始化：

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

1. 创建连接 `Connection` 实例，可以更改 `endpoint` 以测试不同的节点。
2. `owner` 为 solana 默认本地钱包。
3. 创建 anchor provider 和 program 实例，根据需要修改 idl 接口文件路径。

### 创建代币

下面是创建代币的方法：

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

注意：创建代币时分为自动发射和手动发射，两者参数部分不同，请注意！！！

区别：
initVirtualQuoteReserves / initVirtualBaseReserves / isLaunchPermitted

```typescript
// 自动发射: isLaunchPermitted: true
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

// 手动发射: isLaunchPermitted: false
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
```

createIx 参数说明：

-   `program`：program 实例。
-   `user`：创建代币的用户公钥。
-   `quoteMint`：quote 代币的 mint 地址，需为合法添加的 quote 代币。
-   `baseMint`：base 代币的 mint 地址。
-   `feeRecipient`：手续费接收地址。
-   `args`：代币参数。

args 说明：

-   `name`、`symbol` 和 `uri`：代币的基本信息。
-   `supply`：代币的供应量，受 `baseMinSupply` 和 `baseMaxSupply` 约束。
-   `target`：quote 代币在 bonding curve 中所需的数量。
-   `initVirtualQuoteReserves` 和 `initVirtualBaseReserves`：组成 bonding curve 恒积公式的初始值。
-   `feeBps`：每次交易的手续费，单位为 bps（1% 到 50%）。
-   `createFee`：创建代币时需支付的费用，可以为 0。
-   `isLaunchPermitted`：控制代币是否自动发射，true 为自动发射，false 为手动发射。

### 买

下面是买的方法：

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

buyIx 参数说明：

-   `program`：program 实例。
-   `user`：创建代币的用户公钥。
-   `quoteMint`：quote 代币的 mint 地址，需为合法添加的 quote 代币。
-   `baseMint`：base 代币的 mint 地址。
-   `feeRecipient`：手续费接收地址。
-   `args`：代币参数。

args 说明：

-   `quoteCost`：花费的 quote 代币数量。
-   `minBaseAmount`：最少获取的 base 代币数量，以计算是否超过滑点。

### 卖

下面是卖的方法：

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

sellIx 参数说明：

-   `program`：program 实例。
-   `user`：创建代币的用户公钥。
-   `quoteMint`：quote 代币的 mint 地址，需为合法添加的 quote 代币。
-   `baseMint`：base 代币的 mint 地址。
-   `feeRecipient`：手续费接收地址。
-   `args`：代币参数。

参数说明：

-   `baseCost`：花费的 base 代币数量。
-   `minQuoteAmount`：最少获取的 quote 代币数量，以计算是否超过滑点。
