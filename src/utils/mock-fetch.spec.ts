import { mockFetch } from './mock-fetch'
import { stopWatch } from './stop-watch'

describe('mockFetch', () => {
  it('responds with specified HTTP status', async () => {
    await expect(mockFetch('http://respond/in/10/ms/with/204'))
      .resolves.toMatchObject({ status: 204, statusText: 'No Content' })

    await expect(mockFetch('http://respond/in/10/ms/with/200/{"some":"content"}'))
      .resolves.toMatchObject({ status: 200, statusText: 'OK' })

    await expect(mockFetch('http://respond/in/10/ms/with/400'))
      .resolves.toMatchObject({ status: 400, statusText: 'Bad Request' })

    await expect(mockFetch('http://respond/in/10/ms/with/500/Whoops, something went wrong'))
      .resolves.toMatchObject({ status: 500, statusText: 'Internal Server Error' })
  })

  it('responds with specified payload', async () => {
    await expect(
      (await mockFetch('http://respond/in/10/ms/with/200/{"some":"content"}')).json()
    ).resolves.toEqual({ some: 'content' })

    await expect(
      (await mockFetch('http://respond/in/10/ms/with/500/Whoops, something went wrong')).text()
    ).resolves.toEqual('Whoops, something went wrong')
  })

  it('throws a generic error when asked', async () => {
    await expect(mockFetch('http://fail/in/10/ms/with/Whoops, something went wrong')).rejects.toThrow('Whoops, something went wrong')
  })

  it('echos the incoming payload', async () => {
    const payload = { some: 'content' }
    const response = await mockFetch('http://echo/in/10/ms/with/200', { method: 'post', body: JSON.stringify(payload) })
    await expect(response.json()).resolves.toEqual({ some: 'content' })
  })

  it('waits before responding or failing', async () => {
    const lap = stopWatch()

    await mockFetch('http://echo/in/100/ms/with/200', { method: 'post', body: JSON.stringify({}) })
    expect(lap()).toBeCloseTo(100, -1)

    await mockFetch('http://respond/in/50/ms/with/200')
    expect(lap()).toBeCloseTo(50, -1)

    await mockFetch('http://fail/in/150/ms/with/Whoops').catch(() => undefined)
    expect(lap()).toBeCloseTo(150, -1)
  })
})
