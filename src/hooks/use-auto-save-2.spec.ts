import { renderHook } from '@testing-library/react-hooks'

import { FetchState } from './use-fetch-json'
import { useAutoSave } from './use-auto-save-2'
import { FetchSpy, mockFetch } from '../utils/mock-fetch'

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

describe('useAutoSave', () => {
  it('saves on first render', async () => {
    renderHook(() =>
      useAutoSave('data', 'http://respond/in/100/ms/with/204')
    )

    expect(fetchSpy).toHaveBeenCalled()
  })

  // --

  it('does not save when data do not change', async () => {
    const { rerender } = renderHook(() =>
      useAutoSave('data', 'http://respond/in/100/ms/with/204')
    )
    expect(fetchSpy).toHaveBeenCalled()

    rerender()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  // --

  it('re-saves when data change', async () => {
    const props = {
      data: 'data'
    }
    const { rerender } = renderHook(() =>
      useAutoSave(props.data, 'http://respond/in/100/ms/with/204')
    )

    props.data = 'data2'
    rerender()

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  // --

  it('reports saving state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutoSave('data', 'http://respond/in/100/ms/with/204')
    )

    expect(result.current).toBe(FetchState.PENDING)

    await waitForNextUpdate()

    expect(result.current).toBe(FetchState.IDLE)
  })

  // --

  it('reports error state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutoSave('data', 'http://respond/in/100/ms/with/403')
    )

    expect(result.current).toBe(FetchState.PENDING)

    await waitForNextUpdate()

    expect(result.current).toBe(FetchState.ERROR)
  })
})
