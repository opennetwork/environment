export interface SyncLocalStorage<T> {
    run(value: T, callback: () => void): void
    getStore(): T | undefined
    enterWith(value: T): void
}

export interface LocalStorage<T> {
    run<Z>(value: T, callback: () => Z | Promise<Z>): Promise<Z>
    enterWith(value: T): void
    getStore(): T | undefined
}

const AsyncLocalStorageModule = await import("async_hooks").catch(() => undefined);

function createGlobalLocalStorage<T>(): SyncLocalStorage<T> {
    let globalValue: T;
    return {
        run(value, callback) {
            globalValue = value;
            callback();
        },
        getStore() {
            return globalValue;
        },
        enterWith(value): void {
            globalValue = value;
        }
    };
}

export function createLocalStorage<T = unknown>(): LocalStorage<T> {
    let instance: SyncLocalStorage<T> | undefined

    function getLocalStorageInstance(): SyncLocalStorage<T> {
        if (!AsyncLocalStorageModule || instance) {
            instance = instance ?? createGlobalLocalStorage();
            return instance;
        }
        return instance = new AsyncLocalStorageModule.AsyncLocalStorage();
    }

    return {
        async run<Z>(value: T, callback: () => Z | Promise<Z>): Promise<Z> {
            const instance = getLocalStorageInstance();
            return new Promise<Z>(
                (resolve, reject) => instance.run(
                    value,
                    () => Promise.resolve()
                        .then(() => callback())
                        .then(resolve)
                        .catch(reject)
                )
            )
        },
        getStore(): T | undefined {
            // If instance has never been accessed we do not yet have a value
            if (!instance) {
                return undefined;
            }
            return getLocalStorageInstance().getStore()
        },
        enterWith(value: T) {
            const sync = getLocalStorageInstance()
            sync.enterWith(value)
        }
    }
}
