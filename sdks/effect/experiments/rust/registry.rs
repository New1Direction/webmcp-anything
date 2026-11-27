use std::cell::RefCell;
use std::collections::BTreeMap;

#[derive(Default)]
struct Registry {
    names: BTreeMap<Vec<u8>, u32>,
    ordered_ids: Vec<u32>,
    last_id: u32,
}

thread_local! {
    static REGISTRY: RefCell<Registry> = RefCell::default();
    static INPUT: RefCell<[u8; 128]> = const { RefCell::new([0; 128]) };
}

#[no_mangle]
pub extern "C" fn input() -> *mut u8 {
    INPUT.with(|buffer| buffer.as_ptr().cast())
}

fn with_name(len: usize, op: impl FnOnce(&[u8]) -> u32) -> u32 {
    INPUT.with_borrow(|buffer| buffer.get(..len).map_or(0, op))
}

#[no_mangle]
pub extern "C" fn lookup(len: usize) -> u32 {
    with_name(len, |name| {
        REGISTRY.with_borrow(|r| r.names.get(name).copied().unwrap_or(0))
    })
}

#[no_mangle]
pub extern "C" fn insert(len: usize) -> u32 {
    with_name(len, |name| {
        REGISTRY.with_borrow_mut(|r| {
            let Some(id) = r.last_id.checked_add(1) else {
                return 0;
            };
            if r.names.contains_key(name) {
                return 0;
            }
            r.names.insert(name.to_vec(), id);
            r.ordered_ids.push(id);
            r.last_id = id;
            id
        })
    })
}

#[no_mangle]
pub extern "C" fn remove(len: usize) -> u32 {
    with_name(len, |name| {
        REGISTRY.with_borrow_mut(|r| {
            let Some(id) = r.names.remove(name) else {
                return 0;
            };
            if let Ok(position) = r.ordered_ids.binary_search(&id) {
                r.ordered_ids.remove(position);
            }
            id
        })
    })
}

#[no_mangle]
pub extern "C" fn count() -> usize {
    REGISTRY.with_borrow(|r| r.ordered_ids.len())
}

#[no_mangle]
pub extern "C" fn ids() -> *const u32 {
    REGISTRY.with_borrow(|r| r.ordered_ids.as_ptr())
}
