extern crate wasm_bindgen;
extern crate web_sys;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greeting() -> String {
    let now = web_sys::window()
        .expect("should have a Window")
        .performance()
        .expect("should have a Performance")
        .now();
    now.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn it_works() {
        assert_eq!(greeting(), "hello".to_string());
    }
}

