import { StoreKey } from "./key";
import { Store } from "./store";
import { union } from "@virtualstate/union";
import { asyncExtendedIterable } from "iterable"

export interface StoreRouterFunction<Key extends StoreKey = StoreKey, Value = unknown> {
    (key: Key): Promise<Store<Key, Value> | undefined> | Store<Key, Value> | undefined;
}

export interface GetStoresFunction<Key extends StoreKey = StoreKey, Value = unknown> {
    (): AsyncIterable<Store<Key, Value>> | Iterable<Store<Key, Value>>
}

export interface StoreRouter<Key extends StoreKey = StoreKey, Value = unknown> {
    getStore: StoreRouterFunction<Key, Value>;
    getStores?: GetStoresFunction<Key, Value> | Iterable<Store<Key, Value>>;
}

export interface RoutedStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value>, StoreRouter<Key, Value> {
    getStores(): AsyncIterable<Store<Key, Value>>;
}

async function *iterateStores<S, V>(input: AsyncIterable<S>, map: (value: S) => AsyncIterable<V>): AsyncIterable<V> {
    let seen = new Set<V>();
    for await (const nextSet of union(asyncExtendedIterable(input).map(map))) {
        let notSeenCount = 0;
        for (const value of nextSet) {
            if (typeof value === "undefined") continue;
            if (seen.has(value)) continue;
            notSeenCount += 1;
            yield value;
            seen.add(value);
        }
    }
}

export class RoutedStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value> implements RoutedStore<Key, Value> {

    readonly #getStore?: StoreRouterFunction<Key, Value>;
    readonly #getStores?: GetStoresFunction<Key, Value> | Iterable<Store<Key, Value>>;

    constructor(router?: StoreRouter<Key, Value> | StoreRouterFunction<Key, Value>) {
        super();
        this.#getStore = typeof router === "function" ? router : router?.getStore.bind(router);
        this.#getStores = typeof router === "function" ?
            undefined : typeof router?.getStores === "function"
                ? router.getStores?.bind(router) : router?.getStores;
    }

    async getStore(key: Key) {
        if (this.#getStore) {
            return this.#getStore(key);
        }
    }

    async * getStores() {
        if (typeof this.#getStores === "function") {
            yield * this.#getStores();
        } else if (this.#getStores) {
            yield * this.#getStores;
        }
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
        const getStore = (key: Key) => this.getStore(key);
        yield * iterateStores(this.getStores(), async function *(store): AsyncIterable<[Key, Value]> {
            for await (const [key, value] of store.entries()) {
                const targetStore = await getStore(key);
                if (targetStore === store) {
                    yield [key, value];
                }
            }
        });
    }

    async * keys(): AsyncIterable<Key> {
        for await (const [key] of this.entries()) {
            yield key;
        }
    }

    async * values(): AsyncIterable<Value> {
        for await (const [, value] of this.entries()) {
            yield value;
        }
    }


}
