import {getStore, Store} from "./store";
import {RoutedStore} from "./routed";

export interface IsTypedStoreKeyFn<S extends Store> {
    (key: unknown): key is S["__key"]
}

export interface TypedStore<S extends Store> extends Store<S["__key"], S["__value"]> {

}

export function getTypedStore<S extends Store>(isKey: IsTypedStoreKeyFn<S>): TypedStore<S> {
    const globalStore: unknown = getStore();
    return new RoutedStore(
        {
            getStore(key: unknown) {
                if (!isKeyValidForStore(globalStore, key)) {
                    return undefined;
                }
                return globalStore;
            },
            async * getStores() {
                brandGlobalStoreAsTyped(globalStore);
                yield globalStore;
            }
        }
    );
    function brandGlobalStoreAsTyped(store: unknown): asserts store is TypedStore<S> {

    }
    function isKeyValidForStore(store: unknown, key: unknown): store is TypedStore<S> {
        return isKey(key) && store === globalStore;
    }
}
