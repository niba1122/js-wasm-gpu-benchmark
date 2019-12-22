export default async function benchmark(
  n: number,
  block: ((i: number) => void) | ((i: number) => Promise<void>),
): Promise<{
  average: number
}> {
  const startTime = performance.now();
  for (let i = 0; i < n; i++) {
    await block(i)
  }
  const endTime = performance.now();

  return {
    average: (endTime - startTime) / n
  }
}
