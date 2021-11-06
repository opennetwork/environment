export interface LensRay<T> {
    value: T;
}
export interface LensChange<T, R extends LensRay<T> = LensRay<T>> {
    additions: Iterable<R>;
    deletions: Iterable<R>;
}
export declare type LensSource<T, C extends LensChange<T> = LensChange<T>> = Iterable<T> | (Iterable<T> & AsyncIterable<C>);
export interface Lens<T, C extends LensChange<T> = LensChange<T>, S extends LensSource<T, C> = LensSource<T, C>> extends Iterable<T>, AsyncIterable<C> {
    open: boolean;
}
export declare class Lens<T, C extends LensChange<T> = LensChange<T>, S extends LensSource<T, C> = LensSource<T, C>> implements Lens<T, C> {
    protected source?: S;
    constructor(source?: S);
    [Symbol.iterator](): Generator<T, void, undefined>;
    [Symbol.asyncIterator](): AsyncGenerator<C, void, undefined>;
}
export declare function scalar<T>(lens: Lens<T>): T | undefined;
export declare function array<T>(lens: Lens<T>): T[];
export declare function additions<T, C extends LensChange<T>>(lens: Lens<T, C>): AsyncIterable<C["additions"]>;
export declare function deletions<T, C extends LensChange<T>>(lens: Lens<T, C>): AsyncIterable<C["deletions"]>;
export declare function onChange<T, C extends LensChange<T>>(lens: Lens<T, C>): Promise<C | undefined>;
export declare function onAddition<T, C extends LensChange<T>>(lens: Lens<T, C>): Promise<C["additions"] | undefined>;
export declare function onDeletion<T, C extends LensChange<T>>(lens: Lens<T, C>): Promise<C["deletions"] | undefined>;
