import { Store } from "./store/store.js";
import { JSONStore } from "./json.js";
function fetchStore(options) {
    return new JSONStore({
        base: {
            async get(key) {
                const response = await fetch(key, {
                    method: "GET"
                });
                if (!hasWithResponse(response)) {
                    return undefined;
                }
                return response.text();
            },
            async set(key, value) {
                const response = await fetch(key, {
                    method: "PUT",
                    body: value
                });
                if (!response.ok) {
                    throw new Error("Failed to save value");
                }
            },
            async delete(key) {
                const response = await fetch(key, {
                    method: "DELETE"
                });
                if (!response.ok) {
                    throw new Error("Failed to delete value");
                }
            },
            async has(key) {
                return has(key);
            },
            async *keys() {
                if (options.keys) {
                    return yield* options.keys();
                }
                if (!options.root) {
                    return;
                }
                if (!isContainerPath(options.root)) {
                    throw new Error("Given root is not a container path");
                }
                const response = await fetch(options.root, {
                    method: "GET"
                }, options => setHeaders(options, {
                    "Accept": "application/ld+json",
                    "": "http://www.w3.org/ns/ldp#BasicContainer"
                }));
            }
        },
        is: options.is
    });
    async function fetch(key, givenOptions, updateOptions) {
        return options.fetch(key, buildOptions());
        function buildOptions() {
            let resultOptions = {
                ...givenOptions,
                ...(typeof options.options === "function" ? options.options(key, givenOptions) : options.options),
            };
            if (updateOptions) {
                resultOptions = updateOptions(resultOptions);
            }
            if (!hasHeader(resultOptions, "Accept")) {
                resultOptions = setHeader(resultOptions, "Accept", "application/json;q=1,application/ld+json;q=0.5");
            }
            return resultOptions;
        }
    }
    async function has(key) {
        const response = await fetch(key, {
            method: "OPTIONS"
        });
        return hasWithResponse(response);
    }
    function hasWithResponse(response) {
        if (response.ok) {
            return true;
        }
        if (response.status === 401) {
            return false;
        }
        // TODO handle multiple choices etc
        return false;
    }
    function hasHeader(options, key) {
        if (isHeaderClass(options.headers)) {
            return options.headers.has(key);
        }
        if (!options.headers) {
            return false;
        }
        const value = options.headers[key];
        return !!(Array.isArray(value) ? value.length : value);
    }
    function setHeaders(givenOptions, values) {
        let resultOptions = givenOptions;
        for (const key in Object.keys(values)) {
            resultOptions = setHeader(resultOptions, key, values[key]);
        }
        return resultOptions;
    }
    function setHeader(options, key, value) {
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
        };
    }
    function isHeaderClass(headers) {
        function isClassLike(headers) {
            return !!headers;
        }
        return (isClassLike(headers) &&
            typeof headers.set === "function" &&
            typeof headers.append === "function" &&
            typeof headers.has === "function");
    }
    function isContainerPath(key) {
        if (options.isContainerPath) {
            return options.isContainerPath(key);
        }
        const url = new URL(key.toString(), "https://example.com");
        // Solid, §3.1: "Paths ending with a slash denote a container resource."
        // https://solid.github.io/specification/protocol#uri-slash-semantics
        return url.pathname.endsWith("/");
    }
}
export class FetchStore extends Store {
    constructor(options) {
        super(fetchStore(options));
    }
}
