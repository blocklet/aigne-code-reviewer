import './fetch-polyfill'

import { info, setFailed, warning } from '@actions/core'
import { AIAgent, ClaudeChatModel, ExecutionEngine } from '@aigne/core'
import pRetry from 'p-retry'
import { ModelOptions, Options } from './options'

// define type to save message and thread ids
export interface Ids {
  messageId?: string
  threadId?: string
}

export class Bot {
  private readonly api: ClaudeChatModel | null = null
  private readonly options: Options
  private readonly modelOptions: ModelOptions

  constructor(options: Options, modelOptions: ModelOptions) {
    this.options = options
    this.modelOptions = modelOptions
    if (process.env.ANTHROPIC_API_KEY) {
      this.api = new ClaudeChatModel({
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: this.modelOptions.model
      })
    } else {
      const err =
        "Unable to initialize the Anthropic API, 'ANTHROPIC_API_KEY' environment variable is not available"
      throw new Error(err)
    }
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: unknown) {
      warning(`Failed to chat: ${e}, backtrace: ${(e as Error).stack}`)
      return res
    }
  }

  private readonly chat_ = async (
    message: string,
    // eslint-disable-next-line no-unused-vars
    ids: Ids
  ): Promise<[string, Ids]> => {
    // record timing
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let response: string = ''

    if (this.api != null) {
      const currentDate = new Date().toISOString().split('T')[0]
      const reviewAgent = AIAgent.from({
        name: 'Code Reviewer',
        instructions: `${this.options.systemMessage}
Knowledge cutoff: ${this.modelOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${this.options.language}
`
      })
      const engine = new ExecutionEngine({ model: this.api })

      try {
        const result = await pRetry(
          () =>
            engine.call(reviewAgent, {
              messages: [
                {
                  role: 'user',
                  content: message
                }
              ],
              modelOptions: {
                model: this.modelOptions.model,
                temperature: this.options.openaiModelTemperature
              }
            }),
          {
            retries: this.options.openaiRetries
          }
        )
        info(`result: ${JSON.stringify(result)}`)
        response = ''
      } catch (e: unknown) {
        info(
          `response: ${response}, failed to send message to anthropic: ${e}, backtrace: ${
            (e as Error).stack
          }`
        )
      }
      const end = Date.now()
      info(`response: ${response}`)
      info(
        `anthropic sendMessage (including retries) response time: ${
          end - start
        } ms`
      )
    } else {
      setFailed('The Anthropic API is not initialized')
    }

    if (!response) {
      warning('anthropic response is null or empty')
    }

    // remove the prefix "with " in the response
    if (response.startsWith('with ')) {
      response = response.substring(5)
    }

    if (this.options.debug) {
      info(`anthropic responses: ${response}`)
    }

    const newIds: Ids = {
      messageId: '',
      threadId: ''
    }

    return [response, newIds]
  }
}
