import assert from 'node:assert'
import {
  AIAgent,
  ExecutionEngine,
  OpenAIChatModel,
  parallel,
  runChatLoopInTerminal
} from '@aigne/core'

const { OPENAI_API_KEY } = process.env
assert(OPENAI_API_KEY, 'Please set the OPENAI_API_KEY environment variable')

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY
})

const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Please provide a clear and concise summary of the key features and capabilities of the product. Focus on:

1. Core functionality and main value proposition
2. Key technical capabilities and integrations
3. Notable advantages or differentiators
4. Important limitations or constraints

Format your response as a bulleted list, with each feature clearly described in 1-2 sentences.

Product description:
{{product}}`,
  outputKey: 'features'
})

const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`,
  outputKey: 'audience'
})

const engine = new ExecutionEngine({ model })

const userAgent = engine.call(parallel(featureExtractor, audienceAnalyzer))

await runChatLoopInTerminal(userAgent, {
  welcome: `Hello, I'm a product analyst and market researcher. I can help you with extracting features and identifying target audience.`,
  defaultQuestion: 'AIGNE is a No-code Generative AI Apps Engine',
  inputKey: 'product'
})
