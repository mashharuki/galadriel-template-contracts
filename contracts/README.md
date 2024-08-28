# Contracts setup

## Setup

**Install dependencies**

```
cd contracts
cp template.env .env
npm install
```

Modify .env and add your private key for relevant network  
`PRIVATE_KEY_LOCALHOST` for local node
`PRIVATE_KEY_GALADRIEL` for Galadriel testnet

Rest of this README assumes you are in the `contracts` directory

## Deployment

### Deploy any contract

Get the [oracle address](https://docs.galadriel.com/oracle-address) from the docs and replace `<oracle address>` with
the address.  
Check the available example contracts in the [contracts](contracts) directory

**Compile the contracts**
```
npm run compile
```
**Deploy a contract**
```
npx hardhat deploy --network [network (galadriel or localhost)] --contract [contract name] --oracleaddress [oracle_address] [space separated extra constructor args]
# ChatGpt example, "" is a required constructor arg. "" for empty knowledge base, IPFS CID for knowledge base.
npx hardhat deploy --network galadriel --contract ChatGpt --oracleaddress [oracle_address] ""
# Dall-e example
npx hardhat deploy --network galadriel --contract DalleNft --oracleaddress [oracle_address] "system prompt"
# Groq localhost example (requires running a local node)
npx hardhat deploy --network localhost --contract GroqChatGpt --oracleaddress [oracle_address]
```

**シンプルなLLMコントラクトをデプロイする方法**

```bash
yarn deployOpenAiSimpleLLM:galadriel
```

実行結果例

```bash
Compiled 1 Solidity file successfully (evm target: paris).
OpenAiSimpleLLM contract deployed to 0xd09dFE5025FB25000aA22021F7355656cd10EB17
Done in 6.01s.
```

**シンプルなLLMのAIでテキストをアウトプットさせてみる。**

```bash
npx hardhat call_openai_simple_llm --contract 0xd09dFE5025FB25000aA22021F7355656cd10EB17 --message "Hi! My name is haruki! What's your name??" --network galadriel
```

実行結果例

```bash

```

### Deploy quickstart on Galadriel devnet

Update `.env`:

* Add your private key to `PRIVATE_KEY_GALADRIEL`

* Add the [oracle address](http://docs.galadriel.com/oracle-address) to `ORACLE_ADDRESS`

**Deploy quickstart to Galadriel testnet**

```
npm run deployQuickstart
```

実行結果例


```bash
Quickstart contract deployed to 0x8DF7e6234f76e8fAC829feF83E7520635359094C
Done in 2.55s.
```

**try quickstart script**

```bash
yarn callQuickstart
```

実行結果例

```bash
Compiled 1 Solidity file successfully (evm target: paris).
Enter an image description: white dog
Transaction sent, hash: 0x66b0b931afb2ea98639b4b870db2fd1628a7d5d2d97e80a8a7111da62623b1cc.
Explorer: https://explorer.galadriel.com/tx/0x66b0b931afb2ea98639b4b870db2fd1628a7d5d2d97e80a8a7111da62623b1cc
Image generation started with message: "white dog"
Waiting for response: 
.
.

Image generation completed, image URL: https://storage.googleapis.com/galadriel-assets/38d10a45-a358-45d7-83ef-fd02fd2db65c.png
Done in 27.83s.
```

### Running e2e

To run the whole flow e2e either locally or on Galadriel devnet check out
[e2e deployment readme](README_e2e.md).

### Generating standard Solidity input JSON

This is useful for verifying contracts on the explorer,
using the "Standard JSON input" option.

```bash
npm run generateStandardJson
```

This generated JSON files are in `./contracts/artifacts/solidity-json/contracts`

### Running e2e validation tests

**Deploy test contract to relevant network**

```
npm run deployTest:localhost
```

```
npm run deployTest:galadriel
```

**Single run**

```
npx hardhat e2e --contract-address <Test contract address> --oracle-address <oracle contract address> --network <network>
```

```bash
npx hardhat e2e --contract-address 0xD3095061512BCEA8E823063706BB9B15F75b187b --oracle-address 0x68EC9556830AD097D661Df2557FBCeC166a0A075 --network galadriel
```

**Cron job with Slack**

```
ts-node tasks/e2eCron.ts
```

**Cron job with Slack in docker**

```
docker compose -f docker/docker-compose-e2e.yml up --build -d
```

# Contract debugging

To see if your custom CHAT contract acts as expected can use the debug script

```
npm run debug
```

If your contract has any custom parameters or function names then the configuration at the start of the
debug script has to be changed `./scripts/debugContract.ts`

### シンプルなLLMの呼び出し

LLMの呼び出し：シンプル版
このチュートリアルでは、Galadriel（Devnet）上でSolidityを使用してシンプルなLLMコントラクトを構築します。

GPT-4-turboを使用します。他のLLM、例えばClaude-3.5-SonnetやMistral7Bなど、teeMLで利用可能な他のLLMを使用する場合は、チュートリアルを進め、最後にコードの参照を見つけてください。

チャット履歴（いわゆるチャットボット）を持つLLMを構築するには、「LLMの呼び出し：上級編」をご覧ください。

前提条件
コントラクトをデプロイし、操作するには以下が必要です：

Galadrielアカウント。ウォレットの設定方法については、「Setting Up A Wallet」を参照してください。
ガス料金用のトークン。Galadriel Devnetトークンは「Faucet」から取得できます。
ローカル開発環境をセットアップして最初の例を実行するために、「Quickstart」を確認してください。
コントラクト
以下に完全なコントラクトコードを示します。同じ簡略化されたLLMコントラクトもcontractsフォルダにあります。ここではGPT-4-turboの例を使用し、各変数と関数を解説します。

solidity
コードをコピーする
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./interfaces/IOracle.sol";

contract OpenAiSimpleLLM {
    address private oracleAddress; // 最新のアドレスを使用：https://docs.galadriel.com/oracle-address
    IOracle.Message public message;
    string public response;
    IOracle.OpenAiRequest private config;

    constructor(address initialOracleAddress) {
        oracleAddress = initialOracleAddress;

        config = IOracle.OpenAiRequest({
            model : "gpt-4-turbo", // gpt-4-turbo または gpt-4o
            frequencyPenalty : 21, // > 20の場合null
            logitBias : "", // 空文字列の場合null
            maxTokens : 1000, // 0の場合null
            presencePenalty : 21, // > 20の場合null
            responseFormat : "{\"type\":\"text\"}",
            seed : 0, // null
            stop : "", // null
            temperature : 10, // 例：スケールアップされた温度（10は1.0を意味）、> 20はnullを意味
            topP : 101, // パーセンテージ0-100、> 100はnullを意味
            tools : "",
            toolChoice : "", // "none"または"auto"
            user : "" // null
        });
    }

    function sendMessage(string memory _message) public {
        message = createTextMessage("user", _message);
        IOracle(oracleAddress).createOpenAiLlmCall(0, config);
    }

    // Oracle用
    function onOracleOpenAiLlmResponse(
        uint /*runId*/,
        IOracle.OpenAiResponse memory _response,
        string memory _errorMessage
    ) public {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        if (bytes(_errorMessage).length > 0) {
            response = _errorMessage;
        } else {
            response = _response.content;
        }
    }

    // Oracle用
    function getMessageHistory(
        uint /*_runId*/
    ) public view returns (IOracle.Message[] memory) {
        IOracle.Message;
        messages[0] = message;
        return messages;
    }

    // @notice 指定した役割と内容でテキストメッセージを作成します
    // @param role メッセージの役割
    // @param content メッセージの内容
    // @return 作成されたメッセージ
    function createTextMessage(string memory role, string memory content) private pure returns (IOracle.Message memory) {
        IOracle.Message memory newMessage = IOracle.Message({
            role: role,
            content: new IOracle.Content 
        });
        newMessage.content[0].contentType = "text";
        newMessage.content[0].value = content;
        return newMessage;
    }
}
インポート
始めるには、必要なすべてのインターフェイスをインポートします。これにより、オラクルは正しいデータ構造を持つことができます。

solidity
コードをコピーする
import "./interfaces/IOracle.sol";
IOracle.solがローカルにない場合は、以下のようにGitHubからインポートすることもできます：

solidity
コードをコピーする
import "https://github.com/galadriel-ai/contracts/blob/main/contracts/contracts/interfaces/IOracle.sol";
変数

Galadriel上のteeMLオラクルのアドレス：0x68EC9556830AD097D661Df2557FBCeC166a0A075。このアドレスは、コントラクトをデプロイする際に渡す必要があります。詳細については、こちらをクリックしてください。
solidity
コードをコピーする
address private oracleAddress;
message変数はユーザーの入力を保存します。
solidity
コードをコピーする
IOracle.Message public message; // 例：「猫について教えて」
oracleはresponse変数に応答を保存します。
solidity
コードをコピーする
string public response; // 例：「猫とは…」
config変数はLLMの設定を保存します。この例では、OpenAI LLMの設定を使用します。
solidity
コードをコピーする
IOracle.OpenAiRequest private config;
コンストラクタ
前述のように、コントラクトをデプロイする際にオラクルのアドレスを設定する必要があるので、これはコンストラクタの入力となります。

また、コンストラクタ内でLLMの設定も行います。これには、モデル、温度、シードなどのパラメータが含まれます。詳細については、OpenAIRequestオブジェクトを参照してください。

solidity
コードをコピーする
constructor(address initialOracleAddress) {
    oracleAddress = initialOracleAddress;

    config = IOracle.OpenAiRequest({
        model : "gpt-4-turbo", // gpt-4-turbo または gpt-4o
        frequencyPenalty : 21, // > 20の場合null
        logitBias : "", // 空文字列の場合null
        maxTokens : 1000, // 0の場合null
        presencePenalty : 21, // > 20の場合null
        responseFormat : "{\"type\":\"text\"}",
        seed : 0, // null
        stop : "", // null
        temperature : 10, // 例：スケールアップされた温度（10は1.0を意味）、> 20はnullを意味
        topP : 101, // パーセンテージ0-100、> 100はnullを意味
        tools : "",
        toolChoice : "", // "none"または"auto"
        user : "" // null
    });
}
メッセージ送信関数
LLMの推論を開始するためのパブリック関数です。この例では、sendMessage関数が文字列_messageを受け取ります。

メッセージ変数はcreateOpenAiLlmCallでオラクルに送信されるのではなく、同じコントラクトに保存されます。これはヘルパー関数createTextMessageによって行われます。

オラクルは代わりにこのコントラクトからgetMessageHistory（次のステップ）を読み取ってメッセージ履歴を取得します。この読み取り操作（書き込みではなく）はガスとストレージの節約になります。

createOpenAiLlmCallは、次のパラメータでオラクルを呼び出します：

0：メッセージとその応答を追跡するためのID（後のチュートリアルでrunId）
コンストラクタで設定されたconfig
solidity
コードをコピーする
function sendMessage(string memory _message) public {
    message = createTextMessage("user", _message);
    IOracle(oracleAddress).createOpenAiLlmCall(0, config);
}

function createTextMessage(string memory role, string memory content) private pure returns (IOracle.Message memory) {
    IOracle.Message memory newMessage = IOracle.Message({
        role: role,
        content: new IOracle.Content 
    });
    newMessage.content[0].contentType = "text";
    newMessage.content[0].value = content;
    return newMessage;
}
メッセージ読み取り関数
getMessageHistory関数は、オラクルがメッセージ履歴を取得するために使用されます。この場合、ユーザーが送信した唯一のメッセージです。

