import { StoreKey } from "./store/key";
import { ValueIsFn } from "./json";
import { Store } from "./store/store";
export declare type FSStoreKey = StoreKey;
export interface FSStat {
    isFile(): boolean;
    isDirectory(): boolean;
}
export interface FSPromiseInterface {
    stat(key: string): Promise<FSStat>;
    unlink(key: string): Promise<unknown>;
    writeFile(key: string, value: string, encoding: "utf8"): Promise<void>;
    readFile(key: string, encoding: "utf8"): Promise<string>;
}
export interface FSInterface {
    promises: FSPromiseInterface;
}
export interface FSStoreOptions<Key extends FSStoreKey = FSStoreKey, Value = unknown, Interface extends FSInterface = FSInterface> {
    interface?: Interface;
    keys?(fs: Interface["promises"]): AsyncIterable<Key>;
    is?: ValueIsFn<Value>;
    noErrorOnBadParse?: boolean;
    reviver?: Parameters<typeof JSON.parse>[1];
    replacer?: Parameters<typeof JSON.stringify>[1];
    space?: Parameters<typeof JSON.stringify>[2];
    processHasError?(reason: unknown): boolean;
    processGetError?(reason: unknown): Promise<string | undefined>;
}
export declare class FSStore<Key extends FSStoreKey = FSStoreKey, Value = unknown, Interface extends FSInterface = FSInterface> extends Store<Key, Value> {
    constructor(options: FSStoreOptions<Key, Value, Interface>);
}
