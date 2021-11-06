import { Store } from "./store.js";
import { union } from "@virtualstate/union";
import { asyncExtendedIterable } from "iterable";
async function* iterateStores(input, map) {
    let seen = new Set();
    for await (const nextSet of union(asyncExtendedIterable(input).map(map))) {
        let notSeenCount = 0;
        for (const value of nextSet) {
            if (typeof value === "undefined")
                continue;
            if (seen.has(value))
                continue;
            notSeenCount += 1;
            yield value;
            seen.add(value);
        }
    }
}
export class RoutedStore extends Store {
    #getStore;
    #getStores;
    constructor(router) {
        super();
        this.#getStore = typeof router === "function" ? router : router?.getStore.bind(router);
        this.#getStores = typeof router === "function" ?
            undefined : typeof router?.getStores === "function"
            ? router.getStores?.bind(router) : router?.getStores;
    }
    async getStore(key) {
        if (this.#getStore) {
            return this.#getStore(key);
        }
    }
    async *getStores() {
        if (typeof this.#getStores === "function") {
            yield* this.#getStores();
        }
        else if (this.#getStores) {
            yield* this.#getStores;
        }
    }
    async get(key) {
        const store = await this.getStore(key);
        if (!store)
            return undefined;
        return store.get(key);
    }
    async set(key, value) {
        const store = await this.getStore(key);
        if (!store)
            return;
        await store.set(key, value);
    }
    async delete(key) {
        const store = await this.getStore(key);
        if (!store)
            return;
        await store.delete(key);
    }
    async has(key) {
        const store = await this.getStore(key);
        if (!store)
            return false;
        return store.has(key);
    }
    async *entries() {
        const getStore = (key) => this.getStore(key);
        yield* iterateStores(this.getStores(), async function* (store) {
            for await (const [key, value] of store.entries()) {
                const targetStore = await getStore(key);
                if (targetStore === store) {
                    yield [key, value];
                }
            }
        });
    }
    async *keys() {
        for await (const [key] of this.entries()) {
            yield key;
        }
    }
    async *values() {
        for await (const [, value] of this.entries()) {
            yield value;
        }
    }
}
