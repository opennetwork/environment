export interface SyncLocalStorage<T> {
    run(value: T, callback: () => void): void;
    getStore(): T | undefined;
    enterWith(value: T): void;
}
export interface LocalStorage<T> {
    run<Z>(value: T, callback: () => Z | Promise<Z>): Promise<Z>;
    enterWith(value: T): void;
    getStore(): T | undefined;
}
export declare function createLocalStorage<T = unknown>(): LocalStorage<T>;
