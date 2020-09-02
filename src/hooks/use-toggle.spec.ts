import { act } from 'react-test-renderer'
import { renderHook } from '@testing-library/react-hooks'

import { useToggle } from './use-toggle'

describe('useToggle', () => {
  it('returns expected types', () => {
    const { result } = renderHook(() => useToggle(false))

    expect(typeof result.current[0]).toBe('boolean')
    expect(typeof result.current[1]).toBe('function')
  })

  // --

  it('toggles', () => {
    const { result } = renderHook(() => useToggle(false))

    expect(result.current[0]).toBe(false)

    act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(true)
  })

  // --

  it('toggles there and back again', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1]()
      result.current[1]()
    })

    expect(result.current[0]).toBe(false)
  })

  // --

  it('returns reference stable callback', () => {
    const { result } = renderHook(() => useToggle(false))
    const toggleCallback = result.current[1]

    act(() => {
      toggleCallback()
    })

    expect(result.current[1]).toBe(toggleCallback)
  })
})
