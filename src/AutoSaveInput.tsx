import React, { ChangeEventHandler, useState } from 'react'

import { useAutoSave } from './hooks/use-auto-save-2'
import { FetchState } from './hooks/use-fetch-json'

export function AutoSaveInput () {
  const [value, setValue] = useState('')
  const state = useAutoSave(value, 'https://httpbin.org/status/200')

  const handleChange: ChangeEventHandler<HTMLInputElement> = event => setValue(event.target.value)

  return (
    <label>
      Type to save: <input onChange={handleChange} value={value}/>
      {state === FetchState.PENDING && 'saving ...'}
      {state === FetchState.ERROR && 'ERROR !'}
    </label>
  )
}
