import { Store } from "./store";
export interface IsTypedStoreKeyFn<S extends Store> {
    (key: unknown): key is S["__key"];
}
export interface TypedStore<S extends Store> extends Store<S["__key"], S["__value"]> {
}
export declare function getTypedStore<S extends Store>(isKey: IsTypedStoreKeyFn<S>): TypedStore<S>;
