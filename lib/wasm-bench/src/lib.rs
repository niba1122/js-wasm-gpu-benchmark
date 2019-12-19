extern crate wasm_bindgen;
extern crate web_sys;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run() -> Result {
    let result = benchmark(10000, |_| {
        let hoge = 1;
        let fuga = 2;
        hoge + fuga;
    });
    // result.average
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

fn benchmark<F>(count: i32, process: F) -> BenchmarkResult where F: Fn(i32) {
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
