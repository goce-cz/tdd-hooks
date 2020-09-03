import React, { PropsWithChildren, ReactElement } from 'react'

import { useBusy } from './hooks/use-busy'

export function BusySignal ({ children }: PropsWithChildren<{}>): ReactElement {
  const [busy] = useBusy()

  return (
    <div
      id="Busy"
      style={{ background: busy ? 'red' : 'transparent' }}
    >
      {children}
    </div>
  )

}
