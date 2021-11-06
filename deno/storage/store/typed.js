import { getStore } from "./store.js";
import { RoutedStore } from "./routed.js";
export function getTypedStore(isKey) {
    const globalStore = getStore();
    return new RoutedStore({
        getStore(key) {
            if (!isKeyValidForStore(globalStore, key)) {
                return undefined;
            }
            return globalStore;
        },
        async *getStores() {
            brandGlobalStoreAsTyped(globalStore);
            yield globalStore;
        }
    });
    function brandGlobalStoreAsTyped(store) {
    }
    function isKeyValidForStore(store, key) {
        return isKey(key) && store === globalStore;
    }
}
