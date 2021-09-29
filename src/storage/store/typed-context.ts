import {getTypedStore, TypedStore} from "./typed";
import {Store} from "./store";
import {StoreKey} from "./key";
import {PrefixedStoreKey, isPrefixedStoreKey, getPrefixedStoreKey} from "./prefixed-key";

export interface TypedStoreContext<V extends object, T extends symbol, P extends string = string> {
    prefix: P;
    store: TypedStore<Store<PrefixedStoreKey<StoreKey, T>, V>>;
    getKey<K extends StoreKey>(key: K): PrefixedStoreKey<K, T, P>;
    getKey(key?: StoreKey): PrefixedStoreKey<StoreKey, T, P>;
    isKey<K extends StoreKey>(key: PrefixedStoreKey<K>): key is PrefixedStoreKey<K, T, P>;
    isKey(key: unknown): key is PrefixedStoreKey<StoreKey, T, P>;
}

export function getTypedStoreContext<V extends object, S extends symbol, P extends string>(prefix: P | (() => P), symbol: S, newKey?: () => string): TypedStoreContext<V, S> {
    let key: number | undefined = undefined;

    const store = getTypedStore<Store<PrefixedStoreKey<StoreKey, S>, V>>(isKey);

    return {
        get prefix() {
            return getPrefix();
        },
        getKey,
        isKey,
        store
    };

    function getKey<K extends StoreKey>(key?: K): PrefixedStoreKey<K, S>
    function getKey(key?: StoreKey): PrefixedStoreKey<StoreKey, S>
    function getKey(key?: StoreKey): PrefixedStoreKey<StoreKey, S> {
        return getPrefixedStoreKey(key ?? getNewKey(), getPrefix());
    }

    function getNewKey() {
        if (typeof newKey === "function") {
            return newKey();
        }
        const nextKey = key = (key ?? 0) + 1;
        return `${nextKey}`;
    }

    function getPrefix(): P {
        return typeof prefix === "function" ? prefix() : prefix;
    }

    function isKey(key: unknown): key is PrefixedStoreKey<StoreKey, S> {
        return isPrefixedStoreKey(key, getPrefix());
    }
}
