export default function dotProductJS(a: Float32Array, b: Float32Array, nDim: number): Float32Array { // C = A . B
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
