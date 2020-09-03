export function stopWatch (): () => number {
  let last = Date.now()
  return () => {
    const now = Date.now()
    const elapsed = now - last
    last = now
    return elapsed
  }
}
