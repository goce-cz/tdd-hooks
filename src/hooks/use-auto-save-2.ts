import { useEffect } from 'react'

import { useFetchJson } from './use-fetch-json'

export function useAutoSave (data: any, url: string) {
  const [save, , state]  = useFetchJson()

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
  return state
}
