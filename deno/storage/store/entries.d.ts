import { StoreKey } from "./key";
import { Store } from "./store";
export declare class EntriesStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value> implements Store<Key, Value> {
    #private;
    constructor(input: AsyncIterable<[Key, Value]>);
    set(key: Key, value: Value): Promise<void>;
    delete(key: Key): Promise<void>;
    get(key: Key): Promise<Value | undefined>;
    entries(): AsyncIterable<[Key, Value]>;
    keys(): AsyncIterable<Key>;
    values(): AsyncIterable<Value>;
}
