import { JSONStore } from "./json.js";
import { Store } from "./store/store.js";
function fsStore(options) {
    let _fs = undefined;
    return new JSONStore({
        base: {
            async get(key) {
                const { promises: fs } = await getFS();
                const stringKey = key.toString();
                try {
                    return fs.readFile(stringKey, "utf8");
                }
                catch (error) {
                    if (!options.processGetError) {
                        throw error;
                    }
                    return options.processGetError(error);
                }
            },
            async set(key, value) {
                const { promises: fs } = await getFS();
                const stringKey = key.toString();
                await fs.writeFile(stringKey, value, "utf8");
            },
            async delete(key) {
                const { promises: fs } = await getFS();
                try {
                    const stringKey = key.toString();
                    await fs.unlink(stringKey);
                }
                catch {
                }
            },
            async has(key) {
                const { promises: fs } = await getFS();
                try {
                    const stringKey = key.toString();
                    const stat = await fs.stat(stringKey);
                    return stat.isFile();
                }
                catch (error) {
                    if (!options.processHasError) {
                        return false;
                    }
                    return options.processHasError(error);
                }
            },
            async *keys() {
                if (options.keys) {
                    const { promises: fs } = await getFS();
                    yield* options.keys(fs);
                }
            }
        },
        is: options.is,
        noErrorOnBadParse: options.noErrorOnBadParse,
        reviver: options.reviver,
        replacer: options.replacer,
        space: options.space
    });
    async function getFS() {
        if (_fs) {
            return _fs;
        }
        if (options.interface) {
            return options.interface;
        }
        const module = await import("fs.js");
        if (isFSInterfaceWithPromises(module)) {
            return module;
        }
        throw new Error("Could not utilise fs");
        function isFSInterfaceWithPromises(module) {
            return !!module.promises;
        }
    }
}
export class FSStore extends Store {
    constructor(options) {
        super(fsStore(options));
    }
}
