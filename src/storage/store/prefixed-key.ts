import {StoreKey} from "./key";
import {getEnvironmentConfig} from "../../config/config";

const PrefixedStoreKeySymbol = Symbol("PrefixedStoreKey");
const PrefixedStoreKeyPrefixSymbol = Symbol("PrefixedStoreKeyPrefix");
const PrefixedStoreKeyTypeSymbol = Symbol("PrefixedStoreKeyType");
const PrefixedStoreKeyValueSymbol = Symbol("PrefixedStoreKeyValue");
export type PrefixedStoreKey<K extends StoreKey = StoreKey, T = unknown, P extends string = string> = (K extends string ? `${P}${K}` : string) & {
    [PrefixedStoreKeySymbol]: true
    [PrefixedStoreKeyPrefixSymbol]: P
    [PrefixedStoreKeyTypeSymbol]: T
    [PrefixedStoreKeyValueSymbol]: K
}

export const StorageKeyPrefix = "https://opennetwork.dev/#prefix";
export const StorageKeyPrefixDefault = "https://opennetwork.dev/";
export const StorageKeyPrefixUnknown = "https://opennetwork.dev/#unknownPrefix";
export const StorageKeyPrefixUnknownDefault = "unknown/";

declare global {

    interface EnvironmentConfig extends Record<string, unknown> {
        [StorageKeyPrefix]?: string;
        [StorageKeyPrefixUnknown]?: string;
    }

}

function getStorageKeyPrefixFromConfig(key = StorageKeyPrefix, defaultValue: string = StorageKeyPrefixDefault) {
    const config: Record<string, unknown> = getEnvironmentConfig();
    const value = config[key];
    return typeof value === "string" ? value : defaultValue;
}

export function getStorageKeyPrefix<P>(key?: string, defaultValue?: string): P
export function getStorageKeyPrefix(key = StorageKeyPrefixUnknown, defaultValue: string = StorageKeyPrefixUnknownDefault) {
    const prefixPrefix = getStorageKeyPrefixFromConfig(StorageKeyPrefixUnknown, StorageKeyPrefixUnknownDefault);
    const prefix = getStorageKeyPrefixFromConfig(key, defaultValue);
    return `${prefixPrefix}${prefix}`
}

export function getPrefixedStoreKey<K extends StoreKey = StoreKey, T = unknown, P extends string = string>(key: K, prefix: P): PrefixedStoreKey<K, T, P>
export function getPrefixedStoreKey<K extends StoreKey = StoreKey, T = unknown>(key: K, prefix?: string): PrefixedStoreKey<K, T>
export function getPrefixedStoreKey<K extends StoreKey, T, P extends string>(key: K, prefix: P = getStorageKeyPrefix()): PrefixedStoreKey<K, T, P> {
    const output: unknown = typeof key !== 'string' ? key : `${prefix}${key}`
    brandPrefixedStoreKey(output);
    return output;

    function brandPrefixedStoreKey(key: unknown): asserts key is PrefixedStoreKey<K, T, P> {
        if (!isPrefixedStoreKeyLike(key, prefix)) {
            throw new Error("Expected key to match configured prefix");
        }
    }
}

function isPrefixedStoreKeyLike(value: unknown, prefix = getStorageKeyPrefixFromConfig()): boolean {
    if (!value) return false;
    if (typeof value === "string") {
        return value.startsWith(prefix);
    }
    return isPrefixedStoreKeyLike(String(value), prefix);
}

export function isPrefixedStoreKey<K extends StoreKey, T = unknown, P extends string = string>(key: PrefixedStoreKey<K>, prefix: P): key is PrefixedStoreKey<K, T, P>
export function isPrefixedStoreKey<T = unknown, P extends string = string>(key: unknown, prefix: P): key is PrefixedStoreKey<StoreKey, T, P>
export function isPrefixedStoreKey<T = unknown>(key: unknown, prefix?: string): key is PrefixedStoreKey<StoreKey, T>
export function isPrefixedStoreKey<T = unknown>(key: unknown, prefix = getStorageKeyPrefixFromConfig()): key is PrefixedStoreKey<StoreKey, T> {
    return isPrefixedStoreKeyLike(key, prefix);
}
