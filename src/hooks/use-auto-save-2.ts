import { useEffect } from 'react'

import { FetchState, useFetchJson } from './use-fetch-json'
import { useBusy } from './use-busy'

export function useAutoSave (data: any, url: string) {
  const [save, , state, error] = useFetchJson()

  useEffect(
    () => {
      save(
        url,
        {
          method: 'POST',
          body: JSON.stringify(data)
        }
      )
    },
    [save, data, url]
  )

  const [, setBusy] = useBusy()

  useEffect(
    () => setBusy(state === FetchState.PENDING),
    [setBusy, state]
  )

  useEffect(
    () => console.log(error),
    [error]
  )

  return state
}
