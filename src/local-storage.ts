export interface SyncLocalStorage<T> {
    run(value: T, callback: () => void): void
    getStore(): T | undefined
    enterWith(value: T): void
}

export interface LocalStorage<T> {
    run(value: T, callback: () => void | Promise<void>): Promise<void>
    enterWith(value: T): Promise<void>
    getStore(): T | undefined
}

export function createLocalStorage<T = unknown>(): LocalStorage<T> {
    let sync: SyncLocalStorage<T> | undefined

    async function getSyncLocalStorage() {
        if (sync) {
            return sync
        }
        try {
            const { AsyncLocalStorage } = await import("async_hooks")
            sync = new AsyncLocalStorage()
            return sync
        } catch {
            sync = {
                run(value, callback) {
                    callback()
                },
                getStore() {
                    return undefined
                },
                enterWith(value): void {
                }
            }
            return sync
        }
    }

    return {
        async run(value, callback) {
            const sync = await getSyncLocalStorage()
            return new Promise<void>(
                (resolve, reject) => sync.run(
                    value,
                    () => Promise.resolve()
                        .then(() => callback())
                        .then(resolve)
                        .catch(reject)
                )
            )
        },
        getStore(): T | undefined {
            // If sync has never been accessed we do not yet have a value
            if (!sync) {
                return
            }
            return sync.getStore()
        },
        async enterWith(value: T) {
            const sync = await getSyncLocalStorage()
            sync.enterWith(value)
        }
    }
}
