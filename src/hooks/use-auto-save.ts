import { useCallback, useEffect, useState } from 'react'

export enum SavingState {
  IDLE = 'IDLE',
  SAVING = 'SAVING',
  ERROR = 'ERROR'
}

export function useAutoSave (data: any, url: string, customFetch = fetch) {
  const [state, setState] = useState(SavingState.IDLE)

  const save = useCallback(
    async (dataToSave: any) => {
      setState(SavingState.SAVING)
      try {
        await customFetch(
          url,
          {
            method: 'POST',
            body: JSON.stringify(dataToSave)
          }
        )
        setState(SavingState.IDLE)
      } catch (error) {
        console.error(error)
        setState(SavingState.ERROR)
      }
    },
    [setState, url, customFetch]
  )

  useEffect(
    () => {
      save(data)
    },
    [save, data]
  )
  return state
}
