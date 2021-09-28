import {JSONStore, ValueIsFn} from "./json"
import {Store} from "./store/store"

export type BrowserStoreKey = string | URL

export interface BrowserStorage {
    readonly length: number
    key(index: number): string | undefined | null
    getItem(key: string): string | undefined | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
}

export interface BrowserStoreOptions<Key extends BrowserStoreKey = BrowserStoreKey, Value = unknown> {
    storage: BrowserStorage
    keys?(storage: BrowserStorage): AsyncIterable<Key> | Iterable<Key>
    is?: ValueIsFn<Value>
    isKey?: ValueIsFn<Key>
    noErrorOnBadParse?: boolean
    reviver?: Parameters<typeof JSON.parse>[1]
    replacer?: Parameters<typeof JSON.stringify>[1]
    space?: Parameters<typeof JSON.stringify>[2]
}

export function browserStore<Key extends BrowserStoreKey = BrowserStoreKey, Value = unknown>(options: BrowserStoreOptions<Key, Value>): Store<Key, Value> {
    return new JSONStore<Key, Value>({
        base: {
            async get(key: Key) {
                return options.storage.getItem(getKey(key)) ?? undefined
            },
            async set(key: Key, value: string) {
                options.storage.setItem(getKey(key), value)
            },
            async delete(key: Key) {
                options.storage.removeItem(getKey(key))
            },
            async has(key: Key): Promise<boolean> {
                return typeof options.storage.getItem(getKey(key)) === "string"
            },
            async *keys(): AsyncIterable<Key> {
                if (options.keys) {
                    yield* options.keys(options.storage)
                } else if (options.isKey) {
                    // Use a set as keys are unique, and grab beforehand as keys may be changing, this gives a stable set
                    const keys = new Set<Key>()
                    for (let index = 0; index < options.storage.length; index += 1) {
                        const key = options.storage.key(index)
                        if (options.isKey(key)) {
                            keys.add(key)
                        }
                    }
                    yield* keys
                }
            }
        },
        is: options.is,
        noErrorOnBadParse: options.noErrorOnBadParse,
        reviver: options.reviver,
        replacer: options.replacer,
        space: options.space
    })

    function getKey(key: BrowserStoreKey): string {
        if (typeof key === "string") {
            return key
        }
        // Full value
        return key.toString()
    }
}


export class BrowserStore<Key extends BrowserStoreKey = BrowserStoreKey, Value = unknown> extends Store<Key, Value> {

    constructor(options: BrowserStoreOptions<Key, Value>) {
        super(browserStore(options))
    }

}
