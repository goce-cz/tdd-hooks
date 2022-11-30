import { SpyInstance, ArgumentsType } from 'vitest'
import { getReasonPhrase } from 'http-status-codes'

import { latency } from './latency'

const responseUrlPattern = new RegExp('^https?://respond/in/([0-9]+)/ms/with/([0-9]+)(/(.+))?$')
const echoUrlPattern = new RegExp('^https?://echo/in/([0-9]+)/ms/with/([0-9]+)$')
const failureUrlPattern = new RegExp('^https?://fail/in/([0-9]+)/ms/with/(.+)$')

export const mockFetch: typeof fetch = async (url, { body } = {}) => {
  const responseMatches = responseUrlPattern.exec(url as string)
  if (responseMatches) {
    const [, delay, status, , data] = responseMatches

    await latency(Number(delay))

    const statusCode = Number(status)
    return new Response(data, {
      status: statusCode,
      statusText: getReasonPhrase(statusCode)
    })
  }

  const echoMatches = echoUrlPattern.exec(url as string)
  if (echoMatches) {
    const [, delay, status] = echoMatches

    await latency(Number(delay))

    const statusCode = Number(status)
    return new Response(body, {
      status: statusCode,
      statusText: getReasonPhrase(statusCode)
    })
  }

  const failureMatches = failureUrlPattern.exec(url as string)
  if (failureMatches) {
    const [, delay, error] = failureMatches
    await latency(Number(delay))
    throw new Error(error)
  }

  throw Error('Invalid mock URL syntax')
}

export type FetchSpy = SpyInstance<ArgumentsType<typeof fetch>, ReturnType<typeof fetch>>
