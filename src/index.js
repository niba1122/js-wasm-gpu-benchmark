async function benchmark(n, block, pre) {
  let total = 0;
  for (i = 0; i < n; i++) {
    let value;
    if (pre) {
      value = pre()
    }
    const startTime = Date.now();
    await block(i, value)
    const endTime = Date.now();
    total += endTime - startTime
  }

  return {
    total: total / n
  }
}

function generateFlopsSamples(nSample) {
  const s = new Float32Array(nSample)
  for (let i = 0; i < nSample; i++) {
    s[i] = Math.random()
  }
  return s
}

function generateDotProductSamples(nDim) { // row * column
  function generateSample() {
    const sample = []
    for (let i = 0; i < nDim; i++) {
      sample[i] = []
      for (let j = 0; j < nDim; j++) {
        sample[i][j] = Math.random()
      }
    }
    return sample
  }
  return [generateSample(), generateSample()]
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

const FLOPS_N_SAMPLE = 100000
const FLOPS_SAMPLES = generateFlopsSamples(FLOPS_N_SAMPLE)
const FLOPS_COUNT = 10

const DOT_PRODUCT_N_DIM = 1000;
const [DOT_PRODUCT_SAMPLE_A, DOT_PRODUCT_SAMPLE_B] = generateDotProductSamples(DOT_PRODUCT_N_DIM)
const DOT_PRODUCT_COUNT = 10

////////////////////////////////////////////////////////////////////////////////////////////////////

async function benchmarkFLOPSJavaScript() {
  const { total } = await benchmark(FLOPS_COUNT, () => {
    let result = 0;
    for (let i = 0; i < FLOPS_N_SAMPLE; i++) {
      result += FLOPS_SAMPLES[i]
    }
  })

  console.log('flops js: ', total)
}

async function benchmarkFLOPSGPU() {
  const { total } = await benchmark(FLOPS_COUNT, async (_, value) => {
    await value.data()
  }, () => {
    let result = tf.scalar(0);
    for (let i = 0; i < FLOPS_N_SAMPLE; i++) {
      result.add(FLOPS_SAMPLES[i])
    }
    return result
  })

  console.log('flops gpu: ', total)
}

async function benchmarkDotProductJavaScript() {
  const abSampleA = new Float32Array(DOT_PRODUCT_SAMPLE_A.flat())
  const abSampleB = new Float32Array(DOT_PRODUCT_SAMPLE_B.flat())

  const { total: jsTotal } = await benchmark(DOT_PRODUCT_COUNT, () => {
    dotProductJS(abSampleA, abSampleB, DOT_PRODUCT_N_DIM)
  })

  console.log('js: ', jsTotal)
}

async function benchmarkDotProductGPU() {
  const tfSampleA = tf.tensor2d(DOT_PRODUCT_SAMPLE_A);
  const tfSampleB = tf.tensor2d(DOT_PRODUCT_SAMPLE_B);

  const { total: tfTotal } = await benchmark(DOT_PRODUCT_COUNT, async (_, value) => {
    await value.data()
  }, () => {
    return tf.dot(tfSampleA, tfSampleB)
  })

  console.log('tf: ', tfTotal)
}

////////////////////////////////////////////////////////////////////////////////////////////////////

const loadingDOM = document.getElementById('loading')
const buttonStartFLOPSJavaScriptDOM = document.getElementById('button-start-flops-js')
const buttonStartFLOPSGPUDOM = document.getElementById('button-start-flops-gpu')
const buttonStartFLOPSWebAssemblyDOM = document.getElementById('button-start-flops-wasm')
const buttonStartDotProductJavaScriptDOM = document.getElementById('button-start-dot-product-js')
const buttonStartDotProductGPUDOM = document.getElementById('button-start-dot-product-gpu')
const buttonStartDotProductWebAssemblyDOM = document.getElementById('button-start-dot-product-wasm')

const startBenchmarkIfNeeded = (() => {
  let isBenchmarking = false

  return (benchmark) => {
    if (isBenchmarking) return
    isBenchmarking = true

    loadingDOM.style.visibility = 'visible'
    buttonStartFLOPSJavaScriptDOM.disabled = true
    buttonStartFLOPSGPUDOM.disabled = true
    buttonStartFLOPSWebAssemblyDOM.disabled = true
    buttonStartDotProductJavaScriptDOM.disabled = true
    buttonStartDotProductGPUDOM.disabled = true
    buttonStartDotProductWebAssemblyDOM.disabled = true

    setTimeout(async () => {
      await benchmark()

      setTimeout(() => {
        isBenchmarking = false
        loadingDOM.style.visibility = 'hidden'
      }, 500)

      buttonStartFLOPSJavaScriptDOM.disabled = false
      buttonStartFLOPSGPUDOM.disabled = false
      buttonStartFLOPSWebAssemblyDOM.disabled = false
      buttonStartDotProductJavaScriptDOM.disabled = false
      buttonStartDotProductGPUDOM.disabled = false
      buttonStartDotProductWebAssemblyDOM.disabled = false
    }, 500)
  }
})()

buttonStartFLOPSJavaScriptDOM.addEventListener('click', () => {
  startBenchmarkIfNeeded(() => {
    benchmarkFLOPSJavaScript()
  })
})

buttonStartFLOPSGPUDOM.addEventListener('click', () => {
  startBenchmarkIfNeeded(() => {
    benchmarkFLOPSGPU()
  })
})

buttonStartDotProductJavaScriptDOM.addEventListener('click', () => {
  startBenchmarkIfNeeded(() => {
    benchmarkDotProductJavaScript()
  })
})

buttonStartDotProductGPUDOM.addEventListener('click', () => {
  startBenchmarkIfNeeded(() => {
    benchmarkDotProductGPU()
  })
})
