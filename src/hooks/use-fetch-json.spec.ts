import { act, renderHook } from '@testing-library/react-hooks'

import { FetchState, useFetchJson } from './use-fetch-json'
import { FetchSpy, mockFetch } from '../utils/mock-fetch'
import { latency } from '../utils/latency'

interface ResponseData {
  hello: string
}

let fetchSpy: FetchSpy
beforeAll(() => {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(mockFetch)
})

afterEach(() => {
  fetchSpy.mockClear()
})

afterAll(() => {
  fetchSpy.mockRestore()
})



describe('useFetchJson', () => {
  it('is idle when mounted', () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    expect(fetchSpy).not.toHaveBeenCalled()

    expect(typeof result.current[0]).toBe('function')
    expect(result.current.slice(1)).toEqual([undefined, FetchState.IDLE, undefined])
  })

  // --

  it('initiates request on call', () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://respond/in/100/ms/with/204')
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(result.current.slice(1)).toEqual([undefined, FetchState.PENDING, undefined])
  })

  // --

  it('pulls data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://respond/in/200/ms/with/200/{"hello":"world!"}')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual([{ hello: 'world!' }, FetchState.IDLE, undefined])
  })

  // --

  it('reports HTTP error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://respond/in/100/ms/with/500')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual([undefined, FetchState.ERROR, new Error('HTTP 500 Internal Server Error')])
  })

  // --

  it('reports generic error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://fail/in/100/ms/with/Whoops')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual([undefined, FetchState.ERROR, new Error('Whoops')])
  })

  // --

  it('ignores preceding incomplete requests', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetchJson<ResponseData>())

    act(() => {
      result.current[0]('http://respond/in/200/ms/with/200/"old"')
    })

    await latency(50)

    act(() => {
      result.current[0]('http://respond/in/100/ms/with/200/"new"')
    })

    await waitForNextUpdate()

    expect(result.current.slice(1)).toEqual(['new', FetchState.IDLE, undefined])

    await expect(waitForNextUpdate({timeout: 200})).rejects.toThrow('Timed out in waitForNextUpdate after 200ms.')
  })
})
