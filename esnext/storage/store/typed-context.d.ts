import { TypedStore } from "./typed";
import { Store } from "./store";
import { StoreKey } from "./key";
import { PrefixedStoreKey } from "./prefixed-key";
export interface TypedStoreContext<V extends object, T extends symbol, P extends string = string> {
    prefix: P;
    store: TypedStore<Store<PrefixedStoreKey<StoreKey, T>, V>>;
    getKey<K extends StoreKey>(key: K): PrefixedStoreKey<K, T, P>;
    getKey(key?: StoreKey): PrefixedStoreKey<StoreKey, T, P>;
    isKey<K extends StoreKey>(key: PrefixedStoreKey<K>): key is PrefixedStoreKey<K, T, P>;
    isKey(key: unknown): key is PrefixedStoreKey<StoreKey, T, P>;
}
export declare function getTypedStoreContext<V extends object, S extends symbol, P extends string>(prefix: P | (() => P), symbol: S, newKey?: () => string): TypedStoreContext<V, S>;
