import * as tf from '@tensorflow/tfjs'
import benchmark from './benchmark';
import dotProductJS from './dot-product';

let wasmBench: typeof import('wasm-bench') | undefined;

async function loadWasmBench() {
  wasmBench = await import('wasm-bench')
}

function generateFlopsSamples(nSample: number): Float32Array {
  const s = new Float32Array(nSample)
  for (let i = 0; i < nSample; i++) {
    s[i] = Math.random()
  }
  return s
}

function generateDotProductSamples(nDim: number): [number[][], number[][]] { // row * column
  function generateSample(): number[][] {
    const sample: number[][] = []
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

////////////////////////////////////////////////////////////////////////////////////////////////////

const FLOPS_N_SAMPLE = 100000
const FLOPS_SAMPLES = generateFlopsSamples(FLOPS_N_SAMPLE)
const FLOPS_COUNT = 1000

const DOT_PRODUCT_N_DIM = 1000;
const [DOT_PRODUCT_SAMPLE_A, DOT_PRODUCT_SAMPLE_B] = generateDotProductSamples(DOT_PRODUCT_N_DIM)
const DOT_PRODUCT_COUNT = 10

async function benchmarkFLOPSJavaScript(): Promise<void> {
  const { average } = await benchmark(FLOPS_COUNT, (c) => {
    let result = 0;
    for (let i = 0; i < FLOPS_N_SAMPLE; i++) {
      result += FLOPS_SAMPLES[i]
    }
    if (c === 0) {
      console.log('flops js result: ', result)
    }
  })

  console.log('flops js: ', average)
}

async function benchmarkFLOPSGPU() {
  const { average } = await benchmark(FLOPS_COUNT, async (_, value) => {
    const res = await value.data()
    console.log('flops js result: ', res)
  }, () => {
    let result = tf.addN(Array.from(FLOPS_SAMPLES))
    return result
  })

  console.log('flops gpu: ', average)
}

async function benchmarkDotProductJavaScript() {
  const abSampleA = new Float32Array((DOT_PRODUCT_SAMPLE_A as any).flat())
  const abSampleB = new Float32Array((DOT_PRODUCT_SAMPLE_B as any).flat())

  const { average: jsTotal } = await benchmark(DOT_PRODUCT_COUNT, () => {
    dotProductJS(abSampleA, abSampleB, DOT_PRODUCT_N_DIM)
  })

  console.log('js: ', jsTotal)
}

async function benchmarkDotProductGPU() {
  const tfSampleA = tf.tensor2d(DOT_PRODUCT_SAMPLE_A);
  const tfSampleB = tf.tensor2d(DOT_PRODUCT_SAMPLE_B);

  const { average: tfTotal } = await benchmark(DOT_PRODUCT_COUNT, async (_, value) => {
    await value.data()
  }, () => {
    return tf.dot(tfSampleA, tfSampleB)
  })

  console.log('tf: ', tfTotal)
}

////////////////////////////////////////////////////////////////////////////////////////////////////

const loadingDOM = document.getElementById('loading') || (() => { throw new Error() })()
const buttonStartFLOPSJavaScriptDOM = document.getElementById('button-start-flops-js') || (() => { throw new Error() })()
const buttonStartFLOPSGPUDOM = document.getElementById('button-start-flops-gpu') || (() => { throw new Error() })()
const buttonStartFLOPSWebAssemblyDOM = document.getElementById('button-start-flops-wasm') || (() => { throw new Error() })()
const buttonStartDotProductJavaScriptDOM = document.getElementById('button-start-dot-product-js') || (() => { throw new Error() })()
const buttonStartDotProductGPUDOM = document.getElementById('button-start-dot-product-gpu') || (() => { throw new Error() })()
const buttonStartDotProductWebAssemblyDOM = document.getElementById('button-start-dot-product-wasm') || (() => { throw new Error() })()

const startBenchmarkIfNeeded = (() => {
  let isBenchmarking = false

  return (benchmark: () => void) => {
    if (isBenchmarking) return
    isBenchmarking = true

    loadingDOM.style.visibility = 'visible';
    (buttonStartFLOPSJavaScriptDOM as any).disabled = true;
    (buttonStartFLOPSGPUDOM as any).disabled = true;
    (buttonStartFLOPSWebAssemblyDOM as any).disabled = true;
    (buttonStartDotProductJavaScriptDOM as any).disabled = true;
    (buttonStartDotProductGPUDOM as any).disabled = true;
    (buttonStartDotProductWebAssemblyDOM as any).disabled = true

    setTimeout(async () => {
      await benchmark()

      setTimeout(() => {
        isBenchmarking = false
        loadingDOM.style.visibility = 'hidden'
      }, 500);

      (buttonStartFLOPSJavaScriptDOM as any).disabled = false;
      (buttonStartFLOPSGPUDOM as any).disabled = false;
      (buttonStartFLOPSWebAssemblyDOM as any).disabled = false;
      (buttonStartDotProductJavaScriptDOM as any).disabled = false;
      (buttonStartDotProductGPUDOM as any).disabled = false;
      (buttonStartDotProductWebAssemblyDOM as any).disabled = false
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

buttonStartFLOPSWebAssemblyDOM.addEventListener('click', () => {
  startBenchmarkIfNeeded(() => {
    const result = wasmBench?.runFlops(FLOPS_COUNT, FLOPS_SAMPLES);
    if (!result) return
    console.log('ave: ', result.average)
    console.log('debug: ', result.debug_result)
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

buttonStartDotProductWebAssemblyDOM.addEventListener('click', () => {
  startBenchmarkIfNeeded(() => {
    const abSampleA = new Float32Array((DOT_PRODUCT_SAMPLE_A as any).flat())
    const abSampleB = new Float32Array((DOT_PRODUCT_SAMPLE_B as any).flat())
    const debugResult = new Float32Array((DOT_PRODUCT_SAMPLE_A as any).flat())
    const result = wasmBench?.run(DOT_PRODUCT_COUNT, DOT_PRODUCT_N_DIM, abSampleA, abSampleB, debugResult)
    if (!result) return
    console.log('ave: ', result.average)
    console.log('debug: ', debugResult)
    result.free()
  })
})

loadWasmBench();
