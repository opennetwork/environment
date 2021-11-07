import { Store } from "./store/store";
import { ValueIsFn } from "./json";
export declare type FetchStoreKey = string | URL;
export interface FetchFnReturn<Value> {
    promise(): Promise<Value>;
}
export interface FetchResponse {
    status: number;
    ok: boolean;
    text(): Promise<string>;
}
export interface RequestHeaders {
    has(key: string): boolean;
    set(key: string, value: string): void;
    append(key: string, value: string): void;
}
export interface FetchInterfaceOptions {
    method: "GET" | "PUT" | "DELETE" | "OPTIONS" | "POST";
    body?: string;
    headers?: Record<string, string | string[]> | RequestHeaders;
}
export interface FetchInterface<Options extends FetchInterfaceOptions = FetchInterfaceOptions> {
    (url: FetchStoreKey, options: Options): Promise<FetchResponse>;
}
export interface FetchStoreOptions<Key extends FetchStoreKey = FetchStoreKey, Value = unknown, Options extends FetchInterfaceOptions = FetchInterfaceOptions> {
    fetch: FetchInterface;
    options?: Partial<FetchInterfaceOptions> | ((key: FetchStoreKey, options: FetchInterfaceOptions) => Partial<FetchInterfaceOptions>);
    bucket: string;
    keys?(): AsyncIterable<Key>;
    is?: ValueIsFn<Value>;
    isKey?: ValueIsFn<Key>;
    root?: FetchStoreKey;
    isContainerPath?(key: FetchStoreKey): boolean;
}
export declare class FetchStore<Key extends FetchStoreKey = FetchStoreKey, Value = unknown, Options extends FetchInterfaceOptions = FetchInterfaceOptions> extends Store<Key, Value> {
    constructor(options: FetchStoreOptions<Key, Value>);
}
