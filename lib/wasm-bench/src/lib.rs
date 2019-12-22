extern crate wasm_bindgen;
extern crate web_sys;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run(repeat_count: i32, dim: usize, sample_a: &[f32], sample_b: &[f32], debug_result: &mut [f32]) -> Result {
    let result = benchmark(repeat_count, |_| {
        dot_product(dim, debug_result, sample_a, sample_b);
    });

    Result {
        average: result.average
    }
}

#[wasm_bindgen(js_name = runFlops)]
pub fn run_flops(repeat_count: i32, samples: &[f32]) -> FlopsResult {
    let n_samples = samples.len();
    let mut debug_result: f32 = 0.0;
    let result = benchmark(repeat_count, |i| {
        let sum = sum(n_samples, samples);
        if i == 0 {
            debug_result = sum;
        }
    });

    FlopsResult {
        average: result.average,
        debug_result: debug_result
    }
}

#[wasm_bindgen]
pub struct Result {
    pub average: f64
}

#[wasm_bindgen]
pub struct FlopsResult {
    pub average: f64,
    #[wasm_bindgen(js_name = "debugResult")]
    pub debug_result: f32
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     #[test]
//     fn it_works() {
//         assert_eq!(run(), "hello".to_string());
//     }
// }

struct BenchmarkResult {
    average: f64
}

fn benchmark<F>(count: i32, mut process: F) -> BenchmarkResult where F: FnMut(i32) {
    let performance_timer = web_sys::window()
        .expect("should have a Window")
        .performance()
        .expect("should have a Performance");

    let start_time = performance_timer.now();
    for i in 0..count {
        process(i);
    }
    let end_time = performance_timer.now();
    return BenchmarkResult {
        average: (end_time - start_time) / count as f64
    }
}

fn dot_product(dim: usize, c: &mut [f32], a: &[f32], b: &[f32]) {
    for k in 0..dim {
        for i in 0..dim {
            for j in 0..dim {
                c[i * dim + j] += a[i * dim + k] * b[k * dim + j];
            }
        }
    }
}

fn sum(length: usize, values: &[f32]) -> f32 {
    let mut sum = 0.0;
    for i in 0..length {
        sum += values[i]
    }
    return sum
}
