# Examples

## Setup

**Install dependencies**

```
cd examples
cp template.env .env
npm install
```

Modify .env and add your private key

Rest of this README assumes you are in the `examples` directory

## Running

**Chat GPT example**
```
npm run chat
```

**Chat Vision example**
```
npm run chat_vision
```

**Anthropic Claude example**
```
npm run chat_anthropic
```

**Agent example**
```
npm run agent
```

**SimpleChat example**

```bash
yarn simpleChat
```

```bash
yarn run v1.22.22
$ ts-node simpleLlmChat.ts
Message ChatGPT: Hi! My name is haruki! What's your name??
Message sent, tx hash: 0xfc0e8236922d8af1dac439aeef388f01c7d412eef400162016f499722709b422
Chat started with message: "Hi! My name is haruki! What's your name??"
Response from contract: Hello Haruki! I'm an AI assistant here to help you. You can call me Assistant. How can I assist you today?
Done
Done in 23.06s.
```

```bash
The following data represents a transaction that will be sent to the blockchain. Could you please explain this data in plain language so that even a beginner can understand it?

{
   "from": "0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072",
   "to": "0x1431ea8af860C3862A919968C71f901aEdE1910E",
   "value": 0.01
}
```