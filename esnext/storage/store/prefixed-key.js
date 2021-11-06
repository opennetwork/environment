import { getEnvironmentConfig } from "../../config/config.js";
const PrefixedStoreKeySymbol = Symbol("PrefixedStoreKey");
const PrefixedStoreKeyPrefixSymbol = Symbol("PrefixedStoreKeyPrefix");
const PrefixedStoreKeyTypeSymbol = Symbol("PrefixedStoreKeyType");
const PrefixedStoreKeyValueSymbol = Symbol("PrefixedStoreKeyValue");
export const StorageKeyPrefix = "https://opennetwork.dev/#prefix";
export const StorageKeyPrefixDefault = "https://opennetwork.dev/";
export const StorageKeyPrefixUnknown = "https://opennetwork.dev/#unknownPrefix";
export const StorageKeyPrefixUnknownDefault = "unknown/";
function getStorageKeyPrefixFromConfig(key = StorageKeyPrefix, defaultValue = StorageKeyPrefixDefault) {
    const config = getEnvironmentConfig();
    const value = config[key];
    return typeof value === "string" ? value : defaultValue;
}
export function getStorageKeyPrefix(key = StorageKeyPrefixUnknown, defaultValue = StorageKeyPrefixUnknownDefault) {
    const prefixPrefix = getStorageKeyPrefixFromConfig(StorageKeyPrefixUnknown, StorageKeyPrefixUnknownDefault);
    const prefix = getStorageKeyPrefixFromConfig(key, defaultValue);
    return `${prefixPrefix}${prefix}`;
}
export function getPrefixedStoreKey(key, prefix = getStorageKeyPrefix()) {
    const output = typeof key !== 'string' ? key : `${prefix}${key}`;
    brandPrefixedStoreKey(output);
    return output;
    function brandPrefixedStoreKey(key) {
        if (!isPrefixedStoreKeyLike(key, prefix)) {
            throw new Error("Expected key to match configured prefix");
        }
    }
}
function isPrefixedStoreKeyLike(value, prefix = getStorageKeyPrefixFromConfig()) {
    if (!value)
        return false;
    if (typeof value === "string") {
        return value.startsWith(prefix);
    }
    return isPrefixedStoreKeyLike(String(value), prefix);
}
export function isPrefixedStoreKey(key, prefix = getStorageKeyPrefixFromConfig()) {
    return isPrefixedStoreKeyLike(key, prefix);
}
