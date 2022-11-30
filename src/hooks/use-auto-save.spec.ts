import { renderHook } from '@testing-library/react'
import { beforeAll, vi, afterEach, afterAll, describe, it, expect } from 'vitest'
import { SavingState, useAutoSave } from './use-auto-save'
import { FetchSpy, mockFetch } from '../utils/mock-fetch'
import { waitUntilChanged } from '../utils/wait-until-changed'
import { BusyProvider } from './use-busy'

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

describe('useAutoSave', () => {
  it('saves on first render', () => {
    renderHook(
      () => useAutoSave('data', 'http://respond/in/100/ms/with/204'),
      { wrapper: BusyProvider }
    )

    expect(fetchSpy).toHaveBeenCalled()
  })

  // --

  it('does not save when data do not change', () => {
    const { rerender } = renderHook(
      () => useAutoSave('data', 'http://respond/in/100/ms/with/204'),
      { wrapper: BusyProvider }
    )
    expect(fetchSpy).toHaveBeenCalled()

    rerender()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  // --

  it('re-saves when data change', () => {
    const props = {
      data: 'data'
    }
    const { rerender } = renderHook(
      () => useAutoSave(props.data, 'http://respond/in/100/ms/with/204'),
      { wrapper: BusyProvider }
    )

    props.data = 'data2'
    rerender()

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  // --

  it('reports saving state', async () => {
    const { result } = renderHook(
      () => useAutoSave('data', 'http://respond/in/100/ms/with/204'),
      { wrapper: BusyProvider }
    )

    expect(result.current).toBe(SavingState.SAVING)

    await waitUntilChanged(result)

    expect(result.current).toBe(SavingState.IDLE)
  })

  // --

  it('reports error state', async () => {
    const { result } = renderHook(
      () => useAutoSave('data', 'http://respond/in/100/ms/with/403'),
      { wrapper: BusyProvider }
    )

    expect(result.current).toBe(SavingState.SAVING)

    await waitUntilChanged(result)

    expect(result.current).toBe(SavingState.ERROR)
  })
})
