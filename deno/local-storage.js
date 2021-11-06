const AsyncLocalStorageModule = await import("/resolve/nop.js").catch(() => undefined);
function createGlobalLocalStorage() {
    let globalValue;
    return {
        run(value, callback) {
            globalValue = value;
            callback();
        },
        getStore() {
            return globalValue;
        },
        enterWith(value) {
            globalValue = value;
        }
    };
}
export function createLocalStorage() {
    let instance;
    function getLocalStorageInstance() {
        if (!AsyncLocalStorageModule || instance) {
            instance = instance ?? createGlobalLocalStorage();
            return instance;
        }
        return instance = new AsyncLocalStorageModule.AsyncLocalStorage();
    }
    return {
        async run(value, callback) {
            const instance = getLocalStorageInstance();
            return new Promise((resolve, reject) => instance.run(value, () => Promise.resolve()
                .then(() => callback())
                .then(resolve)
                .catch(reject)));
        },
        getStore() {
            // If instance has never been accessed we do not yet have a value
            if (!instance) {
                return undefined;
            }
            return getLocalStorageInstance().getStore();
        },
        enterWith(value) {
            const sync = getLocalStorageInstance();
            sync.enterWith(value);
        }
    };
}
