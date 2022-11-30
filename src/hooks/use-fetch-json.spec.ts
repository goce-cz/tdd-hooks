import { act, renderHook } from '@testing-library/react'
import { beforeAll, vi, afterEach, afterAll, describe, it, expect } from 'vitest'

import { FetchState, useFetchJson } from './use-fetch-json'
import { FetchSpy, mockFetch } from '../utils/mock-fetch'
import { latency } from '../utils/latency'
import { waitUntilChanged } from '../utils/wait-until-changed'

interface ResponseData {
  hello: string
}

let fetchSpy: FetchSpy
beforeAll(() => {
  fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(mockFetch)
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

  it('initiates request on call', async () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    await act(() => {
      result.current[0]('http://respond/in/100/ms/with/204')
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(result.current.slice(1)).toEqual([undefined, FetchState.PENDING, undefined])
  })

  // --

  it('pulls data', async () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    await act(() => {
      result.current[0]('http://respond/in/200/ms/with/200/{"hello":"world!"}')
    })

    await waitUntilChanged(result)

    expect(result.current.slice(1)).toEqual([{ hello: 'world!' }, FetchState.IDLE, undefined])
  })

  // --

  it('reports HTTP error', async () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    await act(() => {
      result.current[0]('http://respond/in/100/ms/with/500')
    })

    await waitUntilChanged(result)

    expect(result.current.slice(1)).toEqual([undefined, FetchState.ERROR, new Error('HTTP 500 Internal Server Error')])
  })

  // --

  it('reports generic error', async () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    await act(() => {
      result.current[0]('http://fail/in/100/ms/with/Whoops')
    })

    await waitUntilChanged(result)

    expect(result.current.slice(1)).toEqual([undefined, FetchState.ERROR, new Error('Whoops')])
  })

  // --

  it('ignores preceding incomplete requests', async () => {
    const { result } = renderHook(() => useFetchJson<ResponseData>())

    await act(() => {
      result.current[0]('http://respond/in/200/ms/with/200/"old"')
    })

    await latency(50)

    await act(() => {
      result.current[0]('http://respond/in/100/ms/with/200/"new"')
    })

    await waitUntilChanged(result, {timeout: 500})

    expect(result.current.slice(1)).toEqual(['new', FetchState.IDLE, undefined])

    const timedOut = vi.fn()
    await waitUntilChanged(result, {timeout: 200, onTimeout: timedOut})
    expect(timedOut).toHaveBeenCalled()
  })
})
