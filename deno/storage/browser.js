import { JSONStore } from "./json.js";
import { Store } from "./store/store.js";
export function browserStore(options) {
    return new JSONStore({
        base: {
            async get(key) {
                return options.storage.getItem(getKey(key)) ?? undefined;
            },
            async set(key, value) {
                options.storage.setItem(getKey(key), value);
            },
            async delete(key) {
                options.storage.removeItem(getKey(key));
            },
            async has(key) {
                return typeof options.storage.getItem(getKey(key)) === "string";
            },
            async *keys() {
                if (options.keys) {
                    yield* options.keys(options.storage);
                }
                else if (options.isKey) {
                    // Use a set as keys are unique, and grab beforehand as keys may be changing, this gives a stable set
                    const keys = new Set();
                    for (let index = 0; index < options.storage.length; index += 1) {
                        const key = options.storage.key(index);
                        if (options.isKey(key)) {
                            keys.add(key);
                        }
                    }
                    yield* keys;
                }
            }
        },
        is: options.is,
        noErrorOnBadParse: options.noErrorOnBadParse,
        reviver: options.reviver,
        replacer: options.replacer,
        space: options.space
    });
    function getKey(key) {
        if (typeof key === "string") {
            return key;
        }
        // Full value
        return key.toString();
    }
}
export class BrowserStore extends Store {
    constructor(options) {
        super(browserStore(options));
    }
}
