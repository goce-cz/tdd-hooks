import React, { ChangeEventHandler, useState } from 'react'

import { SavingState, useAutoSave } from './hooks/use-auto-save'

export function AutoSaveInput() {
  const [value, setValue] = useState('')
  const state = useAutoSave(value, 'https://httpbin.org/status/200')

  const handleChange: ChangeEventHandler<HTMLInputElement> = event => setValue(event.target.value)

  return (
    <label>
      Type to save: <input onChange={handleChange} value={value} />
      {state === SavingState.SAVING && 'saving ...'}
      {state === SavingState.ERROR && 'ERROR !'}
    </label>
  )
}
