import { useCallback, useState } from 'react'

export function useToggle (initialValue: boolean): [boolean, () => void] {
  const [state, setState] = useState(initialValue)
  const toggle = useCallback(() => setState(prev => !prev),[setState])
  return [state, toggle]
}
