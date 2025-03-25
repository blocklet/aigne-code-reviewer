import './fetch-polyfill'

import { info, setFailed, warning } from '@actions/core'
import Anthropic from '@anthropic-ai/sdk'
import pRetry from 'p-retry'
import { ModelOptions, Options } from './options'

// define type to save message and thread ids
export interface Ids {
  messageId?: string
  threadId?: string
}

export class Bot {
  private readonly api: Anthropic | null = null
  private readonly options: Options
  private readonly modelOptions: ModelOptions

  constructor(options: Options, modelOptions: ModelOptions) {
    this.options = options
    this.modelOptions = modelOptions
    info(`Anthropic API key: ${!!process.env.ANTHROPIC_API_KEY}`)
    if (process.env.ANTHROPIC_API_KEY) {
      this.api = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
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

    let response: Anthropic.Message | undefined

    if (this.api != null) {
      const currentDate = new Date().toISOString().split('T')[0]
      const systemMessage = `${this.options.systemMessage}
Knowledge cutoff: ${this.modelOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${this.options.language}
`

      try {
        const result = await pRetry(
          () =>
            this.api!.messages.create({
              model: this.modelOptions.model,
              // eslint-disable-next-line camelcase
              max_tokens: this.modelOptions.tokenLimits.responseTokens,
              temperature: this.options.openaiModelTemperature,
              messages: [
                {
                  role: 'user',
                  content: message
                }
              ],
              system: systemMessage
            }),
          {
            retries: this.options.openaiRetries
          }
        )
        response = result
      } catch (e: unknown) {
        info(
          `response: ${response}, failed to send message to anthropic: ${e}, backtrace: ${
            (e as Error).stack
          }`
        )
      }
      const end = Date.now()
      info(`response: ${JSON.stringify(response)}`)
      info(
        `anthropic sendMessage (including retries) response time: ${
          end - start
        } ms`
      )
    } else {
      setFailed('The Anthropic API is not initialized')
    }

    let responseText = ''
    if (response != null && response.content[0].type === 'text') {
      responseText = response.content[0].text
    } else {
      warning('anthropic response is null or empty')
    }

    // remove the prefix "with " in the response
    if (responseText.startsWith('with ')) {
      responseText = responseText.substring(5)
    }

    if (this.options.debug) {
      info(`anthropic responses: ${responseText}`)
    }

    const newIds: Ids = {
      messageId: response?.id,
      threadId: ''
    }

    return [responseText, newIds]
  }
}
