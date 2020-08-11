import { useEffect } from 'react'

import { useFetchJson } from './use-fetch-json'

export function useAutoSave (data: any, url: string, customFetch = fetch) {
  const [save, , state]  = useFetchJson(customFetch)

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
