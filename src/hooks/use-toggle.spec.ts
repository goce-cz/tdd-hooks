import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { useToggle } from './use-toggle'

describe('useToggle', () => {
  it('returns expected types', () => {
    const { result } = renderHook(() => useToggle(false))

    expect(typeof result.current[0]).toBe('boolean')
    expect(typeof result.current[1]).toBe('function')
  })

  // --

  it('toggles', async () => {
    const { result } = renderHook(() => useToggle(false))

    expect(result.current[0]).toBe(false)

    await act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(true)
  })

  // --

  it('toggles there and back again', async () => {
    const { result } = renderHook(() => useToggle(false))

    await act(() => {
      result.current[1]()
      result.current[1]()
    })

    expect(result.current[0]).toBe(false)
  })

  // --

  it('returns reference stable callback', async () => {
    const { result } = renderHook(() => useToggle(false))
    const toggleCallback = result.current[1]

    await act(() => {
      toggleCallback()
    })

    expect(result.current[1]).toBe(toggleCallback)
  })
})
