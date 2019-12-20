export default async function benchmark(
  n: number,
  block: ((i: number) => void) | ((i: number) => Promise<void>),
): Promise<{
  average: number
}>;
export default async function benchmark<T>(
  n: number,
  block: ((i: number, value: T) => void) | ((i: number, value: T) => Promise<void>),
  pre: () => T
): Promise<{
  average: number
}>;
export default async function benchmark<T>(
  n: number,
  block: ((i: number, value?: T) => void) | ((i: number, value?: T) => Promise<void>),
  pre?: () => T
): Promise<{
  average: number
}> {
  let total = 0;
  for (let i = 0; i < n; i++) {
    let value: T | undefined;
    if (pre) {
      value = pre()
    }
    const startTime = performance.now();
    await block(i, value)
    const endTime = performance.now();
    total += endTime - startTime
  }

  return {
    average: total / n
  }
}
