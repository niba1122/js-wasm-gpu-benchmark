export function dotProduct(a: Float32Array, b: Float32Array, nDim: number): Float32Array {
  const c = new Float32Array(nDim**2)
  for (let k = 0; k < nDim; k++) {
    for (let i = 0; i < nDim; i++) {
      for (let j = 0; j < nDim; j++) {
        c[i * nDim + j] += a[i * nDim + k] * b[k * nDim + j]
      }
    }
  }
  return c
}

export function sum(length: number, values: Float32Array): number {
  let result = 0
  for (let i = 0; i < length; i++) {
    result += values[i]
  }
  return result
}
