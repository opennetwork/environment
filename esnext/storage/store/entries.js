import { Store } from "./store.js";
const CompleteLook = Symbol("Complete Look");
export class EntriesStore extends Store {
    #cache = new Map();
    #written = new Set();
    #input;
    #seen = new Set();
    #looking = new Map();
    #done = false;
    #iteratorPromise;
    #iterator;
    constructor(input) {
        super();
        this.#input = input;
    }
    async set(key, value) {
        this.#cache.set(key, value);
        this.#markWritten(key);
    }
    async delete(key) {
        this.#cache.delete(key);
        this.#markWritten(key);
    }
    async get(key) {
        await this.#look(key);
        return this.#cache.get(key);
    }
    async *entries() {
        const isDeleted = (key) => {
            return this.#seen.has(key) && !this.#cache.has(key);
        };
        if (this.#done) {
            return yield* this.#cache;
        }
        else {
            for await (const value of this.#input) {
                if (!isDeleted(value[0])) {
                    this.#withResult({ value, done: false });
                    yield value;
                }
            }
        }
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
    #markWritten = (key) => {
        this.#written.add(key);
        this.#markSeen(key);
    };
    #markSeen = (key) => {
        this.#seen.add(key);
        this.#looking.get(key)?.[0]?.();
        this.#looking.delete(key);
    };
    #withResult = (result) => {
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
        function isYieldedResult(result) {
            return !!result.done;
        }
    };
    #look = async (key) => {
        if (key !== CompleteLook && (this.#seen.has(key) || this.#done)) {
            return;
        }
        const currentLooking = key === CompleteLook ? undefined : this.#looking.get(key);
        if (currentLooking) {
            return currentLooking[1];
        }
        const iterate = async () => {
            try {
                if (this.#done)
                    return;
                const iterator = this.#iterator = this.#iterator || this.#input[Symbol.asyncIterator]();
                do {
                    const result = await iterator.next();
                    const nextKey = this.#withResult(result);
                    // No more need to iterate
                    if (nextKey && String(nextKey) === String(key)) {
                        break;
                    }
                } while (!this.#done);
            }
            finally {
                this.#iteratorPromise = undefined;
            }
        };
        let resolve = () => void 0;
        const promise = new Promise(fn => resolve = fn);
        if (key !== CompleteLook) {
            this.#looking.set(key, [resolve, promise]);
        }
        const look = async () => {
            let triggeredIterator = false;
            if (!this.#iteratorPromise) {
                triggeredIterator = true;
                this.#iteratorPromise = iterate();
            }
            await Promise.any([
                promise,
                this.#iteratorPromise
            ]);
            if (!triggeredIterator &&
                (key === CompleteLook || !this.#seen.has(key)) &&
                !this.#done) {
                return look();
            }
        };
        await look();
    };
}
