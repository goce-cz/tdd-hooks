import { useCallback, useEffect, useState } from 'react'

export enum SavingState {
  IDLE = 'IDLE',
  SAVING = 'SAVING',
  ERROR = 'ERROR'
}

export function useAutoSave (data: any, url: string) {
  const [state, setState] = useState(SavingState.IDLE)

  const save = useCallback(
    async (dataToSave: any) => {
      setState(SavingState.SAVING)
      try {
        const response = await fetch(
          url,
          {
            method: 'POST',
            body: JSON.stringify(dataToSave)
          }
        )
        if(!response.ok) {
          throw new Error(`server responded with HTTP ${response.status} ${response.statusText}`)
        }
        setState(SavingState.IDLE)
      } catch (error) {
        setState(SavingState.ERROR)
      }
    },
    [setState, url]
  )

  useEffect(
    () => {
      save(data)
    },
    [save, data]
  )
  return state
}
