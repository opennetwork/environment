import { getTypedStore } from "./typed.js";
import { isPrefixedStoreKey, getPrefixedStoreKey } from "./prefixed-key.js";
export function getTypedStoreContext(prefix, symbol, newKey) {
    let key = undefined;
    const store = getTypedStore(isKey);
    return {
        get prefix() {
            return getPrefix();
        },
        getKey,
        isKey,
        store
    };
    function getKey(key) {
        return getPrefixedStoreKey(key ?? getNewKey(), getPrefix());
    }
    function getNewKey() {
        if (typeof newKey === "function") {
            return newKey();
        }
        const nextKey = key = (key ?? 0) + 1;
        return `${nextKey}`;
    }
    function getPrefix() {
        return typeof prefix === "function" ? prefix() : prefix;
    }
    function isKey(key) {
        return isPrefixedStoreKey(key, getPrefix());
    }
}
