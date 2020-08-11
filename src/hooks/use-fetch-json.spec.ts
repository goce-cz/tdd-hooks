import { act, renderHook } from '@testing-library/react-hooks'
import { FetchState, useFetchJson } from './use-fetch-json'
import { latency } from '../utils'

interface ResponseData {
  hello: string
}

const mockUrlPattern = /https?:\/\/(fail|succede)\/in\/([0-9]+)\/ms\/with\/(.+)/

const mockFetchImpl: typeof fetch = async (url) => {
  const matches = mockUrlPattern.exec(url as string)
  if (!matches) {
    throw Error('Invalid mock URL syntax')
  }
  const [, result, delay, data] = matches
  await new Promise(resolve => setTimeout(resolve, Number(delay)))

  if (result === 'succede') {
    return new Response(data)
  } else {
    throw new Error(data)
  }
}

describe('useFetchJson', () => {
  test('is idle when mounted', () => {
    const mockFetch = jest.fn(mockFetchImpl)
    const { result } = renderHook(() => useFetchJson<ResponseData>(mockFetch))

    expect(mockFetch).not.toHaveBeenCalled()

    expect(typeof result.current[0]).toBe('function')
    expect(result.current.slice(1)).toEqual([undefined, FetchState.IDLE, undefined])
  })

  test('initiates request on call', () => {
    const mockFetch = jest.fn(mockFetchImpl)
    const { result } = renderHook(() => useFetchJson<ResponseData>(mockFetch))

    act(() => {
      result.current[0]('http://succede/in/100/ms/with/"anything"')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(result.current.slice(1)).toEqual([undefined, FetchState.PENDING, undefined])
  })

  test('pulls data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>(mockFetchImpl))

    act(() => {
      result.current[0]('http://succede/in/200/ms/with/{"hello":"world!"}')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual([{ hello: 'world!' }, FetchState.IDLE, undefined])
  })

  test('reports error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>(mockFetchImpl))

    act(() => {
      result.current[0]('http://fail/in/100/ms/with/Whoops')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual([undefined, FetchState.ERROR, new Error('Whoops')])
  })

  test('ignores preceding incomplete requests', async () => {
    const mockFetch = jest.fn(mockFetchImpl)
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>(mockFetch))

    act(() => {
      result.current[0]('http://succede/in/200/ms/with/"old"')
    })

    await latency(50)

    act(() => {
      result.current[0]('http://succede/in/100/ms/with/"new"')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual(['new', FetchState.IDLE, undefined])

    await expect(waitForNextUpdate({timeout: 200})).rejects.toThrow('Timed out in waitForNextUpdate after 200ms.')
  })

})
