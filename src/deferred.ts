export interface Deferred<T> {
    promise: Promise<T>
    resolve(value: T | PromiseLike<T>): void
    reject(reason: unknown): void
}

export function defer<T>(): Deferred<T> {
    let resolve: (value: T) => void = () => {},
        reject: (reason: unknown) => void = () => {}
    const promise = new Promise<T>(
        (resolveFn, rejectFn) => {
            resolve = resolveFn
            reject = rejectFn
        }
    )
    return { promise, resolve, reject }
}
