import { renderHook } from '@testing-library/react-hooks'

import { SavingState, useAutoSave } from './use-auto-save'

const mockSuccessFetchImpl: typeof fetch = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return new Response()
}

const mockFailureFetchImpl: typeof fetch = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  throw new Error('Whoops')
}

describe('useAutoSave', () => {
  test('saves on first render', async () => {
    const mockFetch = jest.fn(mockSuccessFetchImpl)

    renderHook(() =>
      useAutoSave('data', 'http://fake.com', mockFetch)
    )

    expect(mockFetch).toHaveBeenCalled()
  })

  test('does not save when data do not change', async () => {
    const mockFetch = jest.fn(mockSuccessFetchImpl)

    const { rerender } = renderHook(() =>
      useAutoSave('data', 'http://fake.com', mockFetch)
    )
    expect(mockFetch).toHaveBeenCalled()

    rerender()

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('re-saves when data change', async () => {
    const mockFetch = jest.fn(mockSuccessFetchImpl)
    const props = {
      data: 'data'
    }
    const { rerender } = renderHook(() =>
      useAutoSave(props.data, 'http://fake.com', mockFetch)
    )

    props.data = 'data2'
    rerender()

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  test('reports saving state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutoSave('data', 'http://fake.com', mockSuccessFetchImpl)
    )

    expect(result.current).toBe(SavingState.SAVING)

    await waitForNextUpdate()

    expect(result.current).toBe(SavingState.IDLE)
  })

  test('reports error state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAutoSave('data', 'http://fake.com', mockFailureFetchImpl)
    )

    expect(result.current).toBe(SavingState.SAVING)

    await waitForNextUpdate()

    expect(result.current).toBe(SavingState.ERROR)
  })
})
