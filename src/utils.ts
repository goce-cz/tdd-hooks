export const latency = (delay: number) => new Promise(resolve => setTimeout(resolve, delay))

export type FetchSpy = jest.SpyInstance<ReturnType<typeof fetch>, jest.ArgsType<typeof fetch>>

export const mockSuccessFetchImpl: typeof fetch = async () => {
  await latency(100)
  return new Response('{}')
}

export const mockFailureFetchImpl: typeof fetch = async () => {
  await latency(100)
  throw new Error('Whoops')
}
