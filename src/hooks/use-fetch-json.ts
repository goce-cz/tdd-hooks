import { useCallback, useEffect, useRef, useState } from 'react'

export enum FetchState {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  ERROR = 'ERROR'
}

type ChargeReturnType<T extends (...args: any[]) => any, R> = (...args: Parameters<T>) => R;

type JsonFetch = ChargeReturnType<typeof fetch, Promise<void>>
type AsyncStateTuple<T> = [T | undefined, FetchState, Error | undefined]

export function useFetchJson<T> (): [JsonFetch, ...AsyncStateTuple<T>] {
  const [asyncState, setAsyncState] = useState<AsyncStateTuple<T>>([undefined, FetchState.IDLE, undefined])
  const lastTokenRef = useRef({})

  useEffect(
    () => {
      return () => {
        lastTokenRef.current = {}
      }
    },
    []
  )

  const execute = useCallback<JsonFetch>(
    async (...fetchArgs) => {
      const token = {}
      lastTokenRef.current = token
      setAsyncState(([value]) => [value, FetchState.PENDING, undefined])
      try {
        const response = await fetch(...fetchArgs)

        if (response.ok) {
          const json = await response.json()
          if(lastTokenRef.current === token) {
            setAsyncState([json, FetchState.IDLE, undefined])
          }
        } else {
          if(lastTokenRef.current === token) {
            const error = new Error(`HTTP ${response.status} ${response.statusText}`)
            setAsyncState(([value]) => [value, FetchState.ERROR, error])
          }
        }
      } catch (error) {
        if(lastTokenRef.current === token) {
          setAsyncState(([value]) => [value, FetchState.ERROR, error])
        }
      }
    },
    [setAsyncState]
  )

  return [execute, ...asyncState]
}
