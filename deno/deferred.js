export function defer() {
    let resolve = () => { }, reject = () => { };
    const promise = new Promise((resolveFn, rejectFn) => {
        resolve = resolveFn;
        reject = rejectFn;
    });
    return { promise, resolve, reject };
}
