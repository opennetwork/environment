import {StoreKey} from "./store/key";
import {JSONStore, ValueIsFn} from "./json";
import {Store} from "./store/store";

export type FSStoreKey = StoreKey

export interface FSStat {
    isFile(): boolean
    isDirectory(): boolean
}

export interface FSPromiseInterface {
    stat(key: string): Promise<FSStat>
    unlink(key: string): Promise<unknown>
    writeFile(key: string, value: string, encoding: "utf8"): Promise<void>
    readFile(key: string, encoding: "utf8"): Promise<string>
}

export interface FSInterface {
    promises: FSPromiseInterface
}

export interface FSStoreOptions<Key extends FSStoreKey = FSStoreKey, Value = unknown, Interface extends FSInterface = FSInterface> {
    interface?: Interface
    keys?(fs: Interface["promises"]): AsyncIterable<Key>
    is?: ValueIsFn<Value>
    noErrorOnBadParse?: boolean
    reviver?: Parameters<typeof JSON.parse>[1]
    replacer?: Parameters<typeof JSON.stringify>[1]
    space?: Parameters<typeof JSON.stringify>[2]
    processHasError?(reason: unknown): boolean
    processGetError?(reason: unknown): Promise<string | undefined>
}

function fsStore<Key extends FSStoreKey = FSStoreKey, Value = unknown, Interface extends FSInterface = FSInterface>(options: FSStoreOptions<Key, Value, Interface>) {
    let _fs: Interface | undefined = undefined

    return new JSONStore<Key, Value>({
        base: {
            async get(key: Key) {
                const { promises: fs } = await getFS()
                const stringKey = key.toString();
                try {
                    return fs.readFile(stringKey, "utf8")
                } catch (error) {
                    if (!options.processGetError) {
                        throw error
                    }
                    return options.processGetError(error)
                }
            },
            async set(key: Key, value: string) {
                const { promises: fs } = await getFS()
                const stringKey = key.toString();
                await fs.writeFile(stringKey, value, "utf8")
            },
            async delete(key: Key) {
                const { promises: fs } = await getFS()
                try {
                    const stringKey = key.toString();
                    await fs.unlink(stringKey)
                } catch {

                }
            },
            async has(key: Key): Promise<boolean> {
                const { promises: fs } = await getFS()
                try {
                    const stringKey = key.toString();
                    const stat = await fs.stat(stringKey)
                    return stat.isFile()
                } catch(error) {
                    if (!options.processHasError) {
                        return false
                    }
                    return options.processHasError(error)
                }
            },
            async *keys(): AsyncIterable<Key> {
                if (options.keys) {
                    const { promises: fs } = await getFS()
                    yield* options.keys(fs)
                }
            }
        },
        is: options.is,
        noErrorOnBadParse: options.noErrorOnBadParse,
        reviver: options.reviver,
        replacer: options.replacer,
        space: options.space
    })

    async function getFS(): Promise<Interface> {
        if (_fs) {
            return _fs
        }

        if (options.interface) {
            return options.interface
        }

        type FSInterfaceWithPromisesMaybe = { promises?: unknown }

        const module: FSInterfaceWithPromisesMaybe = await import("fs")

        if (isFSInterfaceWithPromises(module)) {
            return module
        }

        throw new Error("Could not utilise fs")

        function isFSInterfaceWithPromises(module: FSInterfaceWithPromisesMaybe): module is Interface {
            return !!module.promises
        }

    }
}

export class FSStore<Key extends FSStoreKey = FSStoreKey, Value = unknown, Interface extends FSInterface = FSInterface> extends Store<Key, Value> {

    constructor(options: FSStoreOptions<Key, Value, Interface>) {
        super(fsStore(options))
    }

}
