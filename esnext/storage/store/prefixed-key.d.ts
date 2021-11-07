import { StoreKey } from "./key";
declare const PrefixedStoreKeySymbol: unique symbol;
declare const PrefixedStoreKeyPrefixSymbol: unique symbol;
declare const PrefixedStoreKeyTypeSymbol: unique symbol;
declare const PrefixedStoreKeyValueSymbol: unique symbol;
export declare type PrefixedStoreKey<K extends StoreKey = StoreKey, T = unknown, P extends string = string> = (K extends string ? `${P}${K}` : string) & {
    [PrefixedStoreKeySymbol]: true;
    [PrefixedStoreKeyPrefixSymbol]: P;
    [PrefixedStoreKeyTypeSymbol]: T;
    [PrefixedStoreKeyValueSymbol]: K;
};
export declare const StorageKeyPrefix = "https://opennetwork.dev/#prefix";
export declare const StorageKeyPrefixDefault = "https://opennetwork.dev/";
export declare const StorageKeyPrefixUnknown = "https://opennetwork.dev/#unknownPrefix";
export declare const StorageKeyPrefixUnknownDefault = "unknown/";
declare global {
    interface EnvironmentConfig extends Record<string, unknown> {
        [StorageKeyPrefix]?: string;
        [StorageKeyPrefixUnknown]?: string;
    }
}
export declare function getStorageKeyPrefix<P>(key?: string, defaultValue?: string): P;
export declare function getPrefixedStoreKey<K extends StoreKey = StoreKey, T = unknown, P extends string = string>(key: K, prefix: P): PrefixedStoreKey<K, T, P>;
export declare function getPrefixedStoreKey<K extends StoreKey = StoreKey, T = unknown>(key: K, prefix?: string): PrefixedStoreKey<K, T>;
export declare function isPrefixedStoreKey<K extends StoreKey, T = unknown, P extends string = string>(key: PrefixedStoreKey<K>, prefix: P): key is PrefixedStoreKey<K, T, P>;
export declare function isPrefixedStoreKey<T = unknown, P extends string = string>(key: unknown, prefix: P): key is PrefixedStoreKey<StoreKey, T, P>;
export declare function isPrefixedStoreKey<T = unknown>(key: unknown, prefix?: string): key is PrefixedStoreKey<StoreKey, T>;
export {};
