import {StoreKey} from "./key";
import {RoutedStore} from "./routed";
import {Store} from "./store";

interface EntriesStoreOptions<Key extends StoreKey = StoreKey, Value = unknown> {
    cache?: Map<Key, Value>,
    written?: Set<Key>
}

const CompleteLook = Symbol("Complete Look");

export class EntriesStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value> implements Store<Key, Value> {

    readonly #cache = new Map<Key, Value>();
    readonly #written = new Set<Key>();
    readonly #input: AsyncIterable<[Key, Value]>;
    readonly #seen = new Set<Key>();
    readonly #looking = new Map<Key, [() => void, Promise<void>]>();

    #done = false;
    #iteratorPromise?: Promise<void>;
    #iterator?: AsyncIterator<[Key, Value]>;

    constructor(
        input: AsyncIterable<[Key, Value]>,
    ) {
        super();
        this.#input = input;
    }

    async set(key: Key, value: Value) {
        this.#cache.set(key, value);
        this.#markWritten(key);
    }

    async delete(key: Key) {
        this.#cache.delete(key);
        this.#markWritten(key);
    }

    async get(key: Key) {
        await this.#look(key);
        return this.#cache.get(key);
    }

    async * entries(): AsyncIterable<[Key, Value]> {
        const isDeleted = (key: Key) => {
            return this.#seen.has(key) && !this.#cache.has(key);
        };
        if (this.#done) {
            return yield * this.#cache;
        } else {
            for await (const value of this.#input) {
                if (!isDeleted(value[0])) {
                    this.#withResult({ value, done: false });
                    yield value;
                }
            }
        }
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

    #markWritten = (key: Key) => {
        this.#written.add(key);
        this.#markSeen(key);
    }

    #markSeen = (key: Key) => {
        this.#seen.add(key);
        this.#looking.get(key)?.[0]?.();
        this.#looking.delete(key);
    }

    #withResult = (result: IteratorResult<[Key, Value]>): Key | undefined => {
        if (!isYieldedResult(result)) {
            this.#done = true;
            this.#iterator = undefined;
            return;
        }

        const [nextKey, nextValue] = result.value;
        if (!this.#written.has(nextKey)) {
            this.#cache.set(nextKey, nextValue);
            this.#markSeen(nextKey);
        }
        return nextKey;

        function isYieldedResult<V>(result: IteratorResult<V>): result is IteratorYieldResult<V> {
            return !!result.done;
        }
    }

    #look = async (key: Key | typeof CompleteLook) => {
        if (key !== CompleteLook && (this.#seen.has(key) || this.#done)) {
            return;
        }
        const currentLooking = key === CompleteLook ? undefined : this.#looking.get(key);
        if (currentLooking) {
            return currentLooking[1];
        }

        const iterate = async () => {
            try {
                if (this.#done) return;
                const iterator = this.#iterator = this.#iterator || this.#input[Symbol.asyncIterator]();
                do {
                    const result = await iterator.next();
                    const nextKey = this.#withResult(result);
                    // No more need to iterate
                    if (nextKey && String(nextKey) === String(key)) {
                        break;
                    }
                } while (!this.#done);
            } finally {
                this.#iteratorPromise = undefined;
            }
        }

        let resolve: () => void = () => void 0;
        const promise = new Promise<void>(fn => resolve = fn);
        if (key !== CompleteLook) {
            this.#looking.set(key, [resolve, promise]);
        }
        const look = async (): Promise<void> => {
            let triggeredIterator = false;
            if (!this.#iteratorPromise) {
                triggeredIterator = true;
                this.#iteratorPromise = iterate();
            }
            await Promise.any([
                promise,
                this.#iteratorPromise
            ]);
            if (
                !triggeredIterator &&
                (key === CompleteLook || !this.#seen.has(key)) &&
                !this.#done
            ) {
                return look();
            }
        }
        await look();
    }


}
