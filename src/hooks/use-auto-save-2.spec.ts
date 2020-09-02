import { renderHook } from '@testing-library/react-hooks'

import { useAutoSave } from './use-auto-save-2'
import { FetchState } from './use-fetch-json'
import { FetchSpy, mockFailureFetchImpl, mockSuccessFetchImpl } from '../utils'

let fetchSpy: FetchSpy
beforeAll(() => {
  fetchSpy = jest.spyOn(global, 'fetch')
})

afterEach(() => {
  fetchSpy.mockClear()
})

afterAll(() => {
  fetchSpy.mockRestore()
})

describe('useAutoSave', () => {
  it('saves on first render', async () => {
    fetchSpy.mockImplementation(mockSuccessFetchImpl)

    renderHook(() =>
      useAutoSave('data', 'http://fake.com')
    )

    expect(fetchSpy).toHaveBeenCalled()
  })

  // --

  it('does not save when data do not change', async () => {
    fetchSpy.mockImplementation(mockSuccessFetchImpl)

    const { rerender } = renderHook(() =>
      useAutoSave('data', 'http://fake.com')
    )
    expect(fetchSpy).toHaveBeenCalled()

    rerender()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  // --

  it('re-saves when data change', async () => {
    fetchSpy.mockImplementation(mockSuccessFetchImpl)

    const props = {
      data: 'data'
    }
    const { rerender } = renderHook(() =>
      useAutoSave(props.data, 'http://fake.com')
    )

    props.data = 'data2'
    rerender()

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  // --

  it('reports saving state', async () => {
    fetchSpy.mockImplementation(mockSuccessFetchImpl)

    const { result, waitForNextUpdate } = renderHook(() =>
      useAutoSave('data', 'http://fake.com')
    )

    expect(result.current).toBe(FetchState.PENDING)

    await waitForNextUpdate()

    expect(result.current).toBe(FetchState.IDLE)
  })

  // --

  it('reports error state', async () => {
    fetchSpy.mockImplementation(mockFailureFetchImpl)

    const { result, waitForNextUpdate } = renderHook(() =>
      useAutoSave('data', 'http://fake.com')
    )

    expect(result.current).toBe(FetchState.PENDING)

    await waitForNextUpdate()

    expect(result.current).toBe(FetchState.ERROR)
  })
})
