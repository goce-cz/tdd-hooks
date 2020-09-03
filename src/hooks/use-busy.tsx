import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  useCallback, useContext, useEffect,
  useMemo, useRef,
  useState
} from 'react'

type SetComponentBusy = (componentToken: {}, busy: boolean) => void

const BusyContext = createContext<readonly [boolean, SetComponentBusy] | null>(null)

export function BusyProvider ({ children }: PropsWithChildren<{}>): ReactElement {
  const [busyComponents, setBusyComponents] = useState(new Set<{}>())

  const setComponentBusy = useCallback<SetComponentBusy>(
    (componentToken, busy) => setBusyComponents(prevState => {
      const newState = new Set(prevState)
      if (busy) {
        newState.add(componentToken)
      } else {
        newState.delete(componentToken)
      }
      return newState
    }),
    [setBusyComponents]
  )

  const busy = busyComponents.size > 0

  const busyContextValue = useMemo(() => [busy, setComponentBusy] as const, [busy, setComponentBusy])

  return <BusyContext.Provider value={busyContextValue}>{children}</BusyContext.Provider>
}

export function useBusy (): [boolean, (busy: boolean) => void] {
  const componentTokenRef = useRef({})
  const contextValue = useContext(BusyContext)
  if (!contextValue) {
    throw Error('`useBusy` can be used only within the scope of `<BusyProvider>`')
  }
  const [busy, setComponentBusy] = contextValue
  const setBusy = useCallback<(busy: boolean) => void>(
    newBusy => setComponentBusy(componentTokenRef.current, newBusy),
    [setComponentBusy]
  )

  useEffect(
    () => () => setComponentBusy(componentTokenRef.current, false),
    [setComponentBusy]
  )

  return [busy, setBusy]
}
