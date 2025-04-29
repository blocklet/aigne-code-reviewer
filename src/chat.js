const { AIAgent, ExecutionEngine } = require('@aigne/core')
const { ClaudeChatModel } = require('@aigne/core/models/claude-chat-model.js')
// import { AIAgent, ExecutionEngine } from '@aigne/core'
// import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";

const model = new ClaudeChatModel({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-latest'
})

const agent = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`,
  outputKey: 'features'
})

const engine = new ExecutionEngine({ model })

engine
  .call(agent, {
    product: 'AIGNE is a No-code Generative AI Apps Engine'
  })
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    console.error(error)
  })
