extern crate wasm_bindgen;
extern crate web_sys;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run(dim: usize, sample_a: &[f32], sample_b: &[f32], debug_result: &mut [f32]) -> Result {
    let result = benchmark(10, |_| {
        dot_product(dim, debug_result, sample_a, sample_b);
    });

    Result {
        average: result.average
    }
}

#[wasm_bindgen]
pub struct Result {
    pub average: f64
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
