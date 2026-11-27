const std = @import("std");
const allocator = std.heap.wasm_allocator;
var entries = std.StringArrayHashMap(u32).init(allocator);
var scratch: [128]u8 = undefined;
var sequence: u32 = 0;

export fn input() [*]u8 {
    return &scratch;
}

export fn lookup(len: usize) u32 {
    return entries.get(scratch[0..len]) orelse 0;
}

export fn insert(len: usize) u32 {
    const key = allocator.dupe(u8, scratch[0..len]) catch return 0;
    const id = std.math.add(u32, sequence, 1) catch {
        allocator.free(key);
        return 0;
    };
    entries.putNoClobber(key, id) catch {
        allocator.free(key);
        return 0;
    };
    sequence = id;
    return id;
}

export fn remove(len: usize) u32 {
    const removed = entries.fetchOrderedRemove(scratch[0..len]) orelse return 0;
    allocator.free(removed.key);
    return removed.value;
}

export fn count() usize {
    return entries.count();
}

export fn ids() [*]const u32 {
    return entries.values().ptr;
}
