import {Contract, ethers, Wallet} from "ethers";
import ABI from "./abis/OpenAiSimpleLLM.json";
import * as readline from 'readline';

require("dotenv").config()

/**
 * 画像を生成するスクリプト
 */
async function main() {
  const rpcUrl = process.env.RPC_URL
  if (!rpcUrl) throw Error("Missing RPC_URL in .env")
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw Error("Missing PRIVATE_KEY in .env")
  const contractAddress = process.env.SIMPLE_LLM_CONTRACT_ADDRESS
  if (!contractAddress) throw Error("Missing SIMPLE_LLM_CONTRACT_ADDRESS in .env")

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new Wallet(
    privateKey, provider
  )
  const contract = new Contract(contractAddress, ABI, wallet)

  // The message you want to start the chat with
  // const message = await getUserInput()

  const message = `
    Please generate monster image.
    At that time, please follow these conditions.

    - Pixel art style
    - A monster that looks like it could appear in Super Mario or Dragon QuestHas or Pokemom
    - wings on its back
    - A posture that gives off an intimidating presence
    - A design reminiscent of old-school games
    - Please make the background transparent.
  `;

  // Call the sendMessage function
  const transactionResponse = await contract.sendMessage(message)
  const receipt = await transactionResponse.wait()
  console.log(`Message sent, tx hash: ${receipt.hash}`)
  console.log(`Chat started with message: "${message}"`)

  // Read the LLM response on-chain
  while (true) {
    const response = await contract.response();
    if (response) {
      console.log("Response from contract:", response);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}


main()
  .then(() => console.log("Done"))