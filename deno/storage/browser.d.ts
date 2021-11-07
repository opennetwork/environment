import { ValueIsFn } from "./json";
import { Store } from "./store/store";
export declare type BrowserStoreKey = string | URL;
export interface BrowserStorage {
    readonly length: number;
    key(index: number): string | undefined | null;
    getItem(key: string): string | undefined | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
export interface BrowserStoreOptions<Key extends BrowserStoreKey = BrowserStoreKey, Value = unknown> {
    storage: BrowserStorage;
    keys?(storage: BrowserStorage): AsyncIterable<Key> | Iterable<Key>;
    is?: ValueIsFn<Value>;
    isKey?: ValueIsFn<Key>;
    noErrorOnBadParse?: boolean;
    reviver?: Parameters<typeof JSON.parse>[1];
    replacer?: Parameters<typeof JSON.stringify>[1];
    space?: Parameters<typeof JSON.stringify>[2];
}
export declare function browserStore<Key extends BrowserStoreKey = BrowserStoreKey, Value = unknown>(options: BrowserStoreOptions<Key, Value>): Store<Key, Value>;
export declare class BrowserStore<Key extends BrowserStoreKey = BrowserStoreKey, Value = unknown> extends Store<Key, Value> {
    constructor(options: BrowserStoreOptions<Key, Value>);
}
