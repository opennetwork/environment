import {AnyStore, AsyncStore, Store} from "./store/store"
import {StoreKey} from "./store/key"

export interface ValueIsFn<Value = unknown> {
    (value: unknown): value is Value
}

export interface JSONStoreOptions<Key extends StoreKey = StoreKey, Value = unknown> {
    base: AnyStore<Key, string>
    is?: ValueIsFn<Value>
    noErrorOnBadParse?: boolean
    reviver?: Parameters<typeof JSON.parse>[1]
    replacer?: Parameters<typeof JSON.stringify>[1]
    space?: Parameters<typeof JSON.stringify>[2]
}

function jsonStore<Key extends StoreKey = StoreKey, Value = unknown>(options: JSONStoreOptions<Key, Value>): AsyncStore<Key, Value> {
    const store = new Store(options.base)
    return {
        async get(key: Key) {
            return parseValue(
                await store.get(key)
            )
        },
        async set(key: Key, value: Value) {
            await store.set(key, stringifyValue(value))
        },
        async delete(key: Key) {
            await store.delete(key)
        },
        async has(key: Key): Promise<boolean> {
            return store.has(key)
        },
        async *keys() {
            yield* store.keys()
        }
    }

    function stringifyValue(value: Value): string {
        return JSON.stringify(value, options.replacer, options.space)
    }

    function parseValue(value: string | undefined): Value | undefined {
        if (typeof value !== "string") {
            return undefined
        }
        try {
            const parsed = JSON.parse(value, options.reviver)
            if (isValue(parsed)) {
                return parsed
            }
            return undefined
        } catch (error) {
            if (options.noErrorOnBadParse) {
                return undefined
            }
            throw error
        }

        function isValue(value: unknown): value is Value {
            if (options.is) {
                return options.is(value)
            }
            return typeof value !== "undefined"
        }
    }
}

export class JSONStore<Key extends StoreKey = StoreKey, Value = unknown> extends Store<Key, Value> {

    constructor(options: JSONStoreOptions<Key, Value>) {
        super(jsonStore(options))
    }

}
