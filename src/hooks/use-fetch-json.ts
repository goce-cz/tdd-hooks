import { useCallback, useState } from 'react'

export enum FetchState {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  ERROR = 'ERROR'
}

type ChargeReturnType<T extends (...args: any[]) => any, R> = (...args: Parameters<T>) => R;

type JsonFetch = ChargeReturnType<typeof fetch, Promise<void>>
type AsyncStateTuple<T> = [T | undefined, FetchState, Error | undefined]

export function useFetchJson<T> (fetchImpl = fetch): [JsonFetch, ...AsyncStateTuple<T>] {
  const [asyncState, setAsyncState] = useState<AsyncStateTuple<T>>([undefined, FetchState.IDLE, undefined])

  const execute = useCallback<JsonFetch>(
    async (...fetchArgs) => {
      setAsyncState(([value]) => [value, FetchState.PENDING, undefined])
      try {
        const response = await fetchImpl(...fetchArgs)

        if (response.ok) {
          const json = await response.json()
          setAsyncState([json, FetchState.IDLE, undefined])
        } else {
          const error = new Error(`HTTP ${response.status} ${response.statusText}`)
          setAsyncState(([value]) => [value, FetchState.ERROR, error])
        }
      } catch (error) {
        setAsyncState(([value]) => [value, FetchState.ERROR, error])
      }
    },
    [setAsyncState, fetchImpl]
  )

  return [execute, ...asyncState]
}
