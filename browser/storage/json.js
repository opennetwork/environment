import { Store } from "./store/store.js";
function jsonStore(options) {
    const store = new Store(options.base);
    return {
        async get(key) {
            return parseValue(await store.get(key));
        },
        async set(key, value) {
            await store.set(key, stringifyValue(value));
        },
        async delete(key) {
            await store.delete(key);
        },
        async has(key) {
            return store.has(key);
        },
        async *keys() {
            yield* store.keys();
        }
    };
    function stringifyValue(value) {
        return JSON.stringify(value, options.replacer, options.space);
    }
    function parseValue(value) {
        if (typeof value !== "string") {
            return undefined;
        }
        try {
            const parsed = JSON.parse(value, options.reviver);
            if (isValue(parsed)) {
                return parsed;
            }
            return undefined;
        }
        catch (error) {
            if (options.noErrorOnBadParse) {
                return undefined;
            }
            throw error;
        }
        function isValue(value) {
            if (options.is) {
                return options.is(value);
            }
            return typeof value !== "undefined";
        }
    }
}
export class JSONStore extends Store {
    constructor(options) {
        super(jsonStore(options));
    }
}
