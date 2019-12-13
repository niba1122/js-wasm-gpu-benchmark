function benchmark(n, block) {
  const startTime = Date.now();
  for (i = 0; i < n; i++) {
    block(i)
  }
  const endTime = Date.now();

  return {
    total: (endTime - startTime) / n
  }
}

function generateSample(nDim) { // row * column
  const sample = []
  for (let i = 0; i < nDim; i++) {
    sample[i] = []
    for (let j = 0; j < nDim; j++) {
      sample[i][j] = Math.random()
    }
  }
  return sample
}

function dotProductJS(a, b, nDim) { // C = A . B
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

////////////////////////////////////////////////////////////////////////////////////////////////////

async function start() {

  const nDim = 100;

  const sampleA = generateSample(nDim)
  const sampleB = generateSample(nDim)
  // const sampleA = new Float32Array([1, 2, 3, 4])
  // const sampleB = new Float32Array([5, 6, 7, 8])
  // const answer = new Float32Array([19, 22, 43, 50])

  const nSample = 2

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const abSampleA = new Float32Array(sampleA.flat())
  const abSampleB = new Float32Array(sampleB.flat())

  // console.log(abSampleA, abSampleB)

  const { total: jsTotal } = benchmark(nSample, () => {
    dotProductJS(abSampleA, abSampleB, nDim)
  })

  console.log('js: ', jsTotal)

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const tfSampleA = tf.tensor2d(sampleA);
  const tfSampleB = tf.tensor2d(sampleB);

  const { total: tfTotal } = benchmark(nSample, () => {
    c = tf.dot(tfSampleA, tfSampleB)
    console.log({...c})
  })

  console.log('tf: ', tfTotal)

}

start()
