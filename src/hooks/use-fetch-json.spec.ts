import { act, renderHook } from '@testing-library/react-hooks'

import { FetchState, useFetchJson } from './use-fetch-json'
import { FetchSpy, latency } from '../utils'

interface ResponseData {
  hello: string
}

const mockUrlPattern = /https?:\/\/(fail|succeed)\/in\/([0-9]+)\/ms\/with\/(.+)/

const mockFetchImpl: typeof fetch = async (url) => {
  const matches = mockUrlPattern.exec(url as string)
  if (!matches) {
    throw Error('Invalid mock URL syntax')
  }
  const [, result, delay, data] = matches
  await new Promise(resolve => setTimeout(resolve, Number(delay)))

  if (result === 'succeed') {
    return new Response(data)
  } else {
    throw new Error(data)
  }
}

let fetchSpy: FetchSpy
beforeAll(() => {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(mockFetchImpl)
})

afterEach(() => {
  fetchSpy.mockClear()
})

afterAll(() => {
  fetchSpy.mockRestore()
})



describe('useFetchJson', () => {
  test('is idle when mounted', () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    expect(fetchSpy).not.toHaveBeenCalled()

    expect(typeof result.current[0]).toBe('function')
    expect(result.current.slice(1)).toEqual([undefined, FetchState.IDLE, undefined])
  })

  // --

  test('initiates request on call', () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://succeed/in/100/ms/with/"anything"')
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(result.current.slice(1)).toEqual([undefined, FetchState.PENDING, undefined])
  })

  // --

  test('pulls data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://succeed/in/200/ms/with/{"hello":"world!"}')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual([{ hello: 'world!' }, FetchState.IDLE, undefined])
  })

  // --

  test('reports error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://fail/in/100/ms/with/Whoops')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual([undefined, FetchState.ERROR, new Error('Whoops')])
  })

  // --

  test('ignores preceding incomplete requests', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://succeed/in/200/ms/with/"old"')
    })

    await latency(50)

    act(() => {
      result.current[0]('http://succeed/in/100/ms/with/"new"')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual(['new', FetchState.IDLE, undefined])

    await expect(waitForNextUpdate({timeout: 200})).rejects.toThrow('Timed out in waitForNextUpdate after 200ms.')
  })
})
