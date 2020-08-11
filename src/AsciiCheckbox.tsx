import React from 'react'
import { useToggle } from './hooks/use-toggle'

export function AsciiCheckbox() {
  const [checked, toggle] = useToggle(false)
  return (
    <code onClick={toggle}>[{ checked ? 'X' : ' '}]</code>
  )
}

