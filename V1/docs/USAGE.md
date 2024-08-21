# 使用文档

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

Game.com 是进行改良优化后 meme coin 发射平台。

```typescript
// mainnet/testnet NEW GAME Program ID
const MAINNET_PROGRAM_ID = "GameEs6zXFFGhE5zCdx2sqeRZkL7uYzPsZuSVn1fdxHF";

// mainnet/testnet TOKEN_METADATA_PROGRAM_ID
export const NEWGAME_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

// IDL：详见/target/idl/new_pump.json
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

`createIx` 为封装的调用合约 `create` 指令，`newPumpFunProgram` 为 program 实例，传入代币信息，`name` 代币名称，`symbol` 代币标识，`uri` 代币链下附属数据地址。`user.publicKey` 为用户公钥，`mint.publicKey` 为 mint 公钥。

### 买

下面是买的方法：

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

`buyIx` 为封装的调用合约 `buy` 指令，`newPumpFunProgram` 为 program 实例，`solCost` 为用户购买花费 sol 的数量，已经包含手续费，`minTokenAmount` 为最低接受到 token 数量，这个数值跟前端的模拟计算和用户选择的滑点有关，这里为 0 是为了方便交互。`user.publicKey` 为用户公钥，`mint.publicKey` 为 mint 公钥。

### 卖

下面是卖的方法：

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

`sellIx` 为封装的调用合约 `sell` 指令，`newPumpFunProgram` 为 program 实例，`tokenCost` 为用户卖出 tokens 的数量，`minSolAmount` 为最低接受到 sol 数量，这个数值跟前端的模拟计算和用户选择的滑点有关，这里为 0 是为了方便交互。`user.publicKey` 为用户公钥，`mint.publicKey` 为 mint 公钥。
