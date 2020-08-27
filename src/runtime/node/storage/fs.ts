import {Store, JSONStore, ValueIsFn} from "../../../storage/storage"
import {StoreKey} from "../../../storage/store/key";

export interface FSStat {
    isFile(): boolean
    isDirectory(): boolean
}

export interface FSPromiseInterface {
    stat(key: StoreKey): Promise<FSStat>
    unlink(key: StoreKey): Promise<FSStat>
    writeFile(key: StoreKey, value: string, encoding: "utf8"): Promise<void>
    readFile(key: StoreKey, encoding: "utf8"): Promise<string>
}

export interface FSInterface {
    promises: FSPromiseInterface
}

export interface FSStoreOptions<Key extends string = string, Value = unknown> {
    interface?: FSInterface
    keys?(fs: FSPromiseInterface): AsyncIterable<Key>
    is?: ValueIsFn<Value>
    noHasOnGet?: boolean
    processHasError?(reason: unknown): boolean
}

function fs<Key extends string = string, Value = unknown>(options: FSStoreOptions<Key, Value>) {
    let _fs: FSPromiseInterface | undefined = undefined

    return new JSONStore<Key, Value>({
        base: {
            async get(key: Key) {
                const fs = await getFS()
                if (!options.noHasOnGet && !(await this.has(key))) {
                    return undefined
                }
                return fs.readFile(key, "utf8")
            },
            async set(key: Key, value: string) {
                const fs = await getFS()
                await fs.writeFile(key, value, "utf8")
            },
            async delete(key: Key) {
                const fs = await getFS()
                try {
                    await fs.unlink(key)
                } catch {

                }
            },
            async has(key: Key): Promise<boolean> {
                const fs = await getFS()
                try {
                    const stat = await fs.stat(key)
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
                    const fs = await getFS()
                    yield* options.keys(fs)
                }
            }
        },
        is: options.is
    })

    async function getFS(): Promise<FSPromiseInterface> {
        if (_fs) {
            return _fs
        }

        const module = await import("fs")

        if (isFSInterface(module)) {
            return module.promises
        }

        throw new Error("Could not utilise fs promises")

        function isFSInterface(module: unknown): module is FSInterface {
            function isFSInterfaceLike(module: unknown): module is { promises?: unknown } {
                return !!module
            }
            return (
                isFSInterfaceLike(module) &&
                !!module.promises
            )
        }

    }

}

export class FSStore<Key extends string = string, Value = unknown> extends Store<string, Value> {

    constructor(options: FSStoreOptions<Key, Value>) {
        super(fs(options))
    }

}
