import {Store} from "./store/store"
import {JSONStore, ValueIsFn} from "./json"

export type FetchStoreKey = string | URL

export interface FetchFnReturn<Value> {
    promise(): Promise<Value>
}

export interface FetchResponse {
    status: number
    ok: boolean
    text(): Promise<string>
}

export interface RequestHeaders {
    has(key: string): boolean
    set(key: string, value: string): void
    append(key: string, value: string): void
}

interface StaticHeaderValues { [key: string]: string }

export interface FetchInterfaceOptions {
    method: "GET" | "PUT" | "DELETE" | "OPTIONS" | "POST"
    body?: string
    headers?: Record<string, string | string[]> | RequestHeaders
}

export interface FetchInterface<Options extends FetchInterfaceOptions = FetchInterfaceOptions> {
    (url: FetchStoreKey, options: Options): Promise<FetchResponse>
}

export interface FetchStoreOptions<Key extends FetchStoreKey = FetchStoreKey, Value = unknown, Options extends FetchInterfaceOptions = FetchInterfaceOptions> {
    fetch: FetchInterface
    options?: Partial<FetchInterfaceOptions> | ((key: FetchStoreKey, options: FetchInterfaceOptions) => Partial<FetchInterfaceOptions>)
    bucket: string
    keys?(): AsyncIterable<Key>
    is?: ValueIsFn<Value>
    isKey?: ValueIsFn<Key>
    root?: FetchStoreKey
    isContainerPath?(key: FetchStoreKey): boolean
}

function fetchStore<Key extends FetchStoreKey, Value, Options extends FetchInterfaceOptions>(options: FetchStoreOptions<Key, Value, Options>) {
    return new JSONStore<Key, Value>({
        base: {
            async get(key: Key) {
                const response = await fetch(key, {
                    method: "GET"
                })
                if (!hasWithResponse(response)) {
                    return undefined
                }
                return response.text()
            },
            async set(key: Key, value: string) {
                const response = await fetch(key, {
                    method: "PUT",
                    body: value
                })
                if (!response.ok) {
                    throw new Error("Failed to save value")
                }
            },
            async delete(key: Key) {
                const response = await fetch(key, {
                    method: "DELETE"
                })
                if (!response.ok) {
                    throw new Error("Failed to delete value")
                }
            },
            async has(key: Key): Promise<boolean> {
                return has(key)
            },
            async *keys(): AsyncIterable<Key> {
                if (options.keys) {
                    return yield* options.keys()
                }
                if (!options.root) {
                    return
                }
                if (!isContainerPath(options.root)) {
                    throw new Error("Given root is not a container path")
                }

                const response = await fetch(
                    options.root,
                    {
                    method: "GET"
                    },
                    options => setHeaders(
                        options,
                        {
                            "Accept": "application/ld+json",
                            "": "http://www.w3.org/ns/ldp#BasicContainer"
                        }
                    )
                )
            }
        },
        is: options.is
    })

    async function fetch(key: FetchStoreKey, givenOptions: Exclude<FetchInterfaceOptions, "headers">, updateOptions?: (options: FetchInterfaceOptions) => FetchInterfaceOptions): Promise<FetchResponse> {
        return options.fetch(key, buildOptions())

        function buildOptions() {
            let resultOptions = {
                ...givenOptions,
                ...(typeof options.options === "function" ? options.options(key, givenOptions) : options.options),
            };
            if (updateOptions) {
                resultOptions = updateOptions(resultOptions);
            }
            if (!hasHeader(resultOptions, "Accept")) {
                resultOptions = setHeader(resultOptions, "Accept", "application/json;q=1,application/ld+json;q=0.5")
            }
            return resultOptions
        }
    }

    async function has(key: FetchStoreKey): Promise<boolean> {
        const response = await fetch(key, {
            method: "OPTIONS"
        })
        return hasWithResponse(response)
    }

    function hasWithResponse(response: FetchResponse) {
        if (response.ok) {
            return true
        }
        if (response.status === 401) {
            return false
        }
        // TODO handle multiple choices etc
        return false
    }

    function hasHeader(options: FetchInterfaceOptions, key: string): boolean {
        if (isHeaderClass(options.headers)) {
            return options.headers.has(key);
        }
        if (!options.headers) {
            return false
        }
        const value = options.headers[key]
        return !!(Array.isArray(value) ? value.length : value)
    }

    function setHeaders(givenOptions: FetchInterfaceOptions, values: StaticHeaderValues) {
        let resultOptions = givenOptions
        for (const key in Object.keys(values)) {
            resultOptions = setHeader(resultOptions, key, values[key])
        }
        return resultOptions
    }

    function setHeader(options: FetchInterfaceOptions, key: string, value: string): FetchInterfaceOptions {
        if (isHeaderClass(options.headers)) {
            options.headers.set(key, value);
            return options;
        }

        return {
            ...options,
            headers: {
                ...options.headers,
                [key]: value
            }
        }
    }

    function isHeaderClass(headers: FetchInterfaceOptions["headers"]): headers is RequestHeaders {
        function isClassLike(headers: unknown): headers is { set: unknown, append: unknown, has: unknown } {
            return !!headers
        }
        return (
            isClassLike(headers) &&
            typeof headers.set === "function" &&
            typeof headers.append === "function" &&
            typeof headers.has === "function"
        )
    }

    function isContainerPath(key: FetchStoreKey): boolean {
        if (options.isContainerPath) {
            return options.isContainerPath(key)
        }
        const url = new URL(key.toString(), "https://example.com")
        // Solid, §3.1: "Paths ending with a slash denote a container resource."
        // https://solid.github.io/specification/protocol#uri-slash-semantics
        return url.pathname.endsWith("/")
    }
}

export class FetchStore<Key extends FetchStoreKey = FetchStoreKey, Value = unknown, Options extends FetchInterfaceOptions = FetchInterfaceOptions> extends Store<Key, Value> {

    constructor(options: FetchStoreOptions<Key, Value>) {
        super(fetchStore(options))
    }

}
