import { RenderHookResult, waitFor, waitForOptions } from '@testing-library/react'
import { expect } from 'vitest'

export const waitUntilChanged = (result: RenderHookResult<any, any>['result'], options?: waitForOptions) => {
  const initial = result.current
  return waitFor(() => {
    expect(initial).not.toBe(result.current)
  }, options)
}
