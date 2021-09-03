import { StoreKey } from "./key";
import { Store } from "./store";

export interface StoreRouterFunction<Key extends StoreKey = StoreKey, Value = unknown> {
    (key: Key): Promise<Store<Key, Value>>;
}

export interface StoreRouter<Key extends StoreKey = StoreKey, Value = unknown> {
    getStore: StoreRouterFunction<Key, Value>;
    // stores?: AsyncIterable<Store<Key, Value>>;
}

export interface RoutedStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value>, StoreRouter<Key, Value> {

}

export class RoutedStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value> implements RoutedStore<Key, Value> {

    readonly #getStore: StoreRouterFunction<Key, Value>;

    constructor(router: StoreRouter<Key, Value> | StoreRouterFunction<Key, Value>) {
        super();
        this.#getStore = typeof router === "function" ? router : router.getStore.bind(router);
    }

    async getStore(key: Key) {
        return this.#getStore(key);
    }

    async get(key: Key): Promise<Value | undefined> {
        const store = await this.getStore(key);
        if (!store) return undefined;
        return store.get(key);
    }

    async set(key: Key, value: Value) {
        const store = await this.getStore(key);
        if (!store) return;
        await store.set(key, value);
    }

    async delete(key: Key) {
        const store = await this.getStore(key);
        if (!store) return;
        await store.delete(key);
    }

    async has(key: Key): Promise<boolean> {
        const store = await this.getStore(key);
        if (!store) return false;
        return store.has(key);
    }

    async * entries(): AsyncIterable<[Key, Value]> {

    }

    async * keys(): AsyncIterable<Key> {

    }

    async * values(): AsyncIterable<Value> {

    }


}
