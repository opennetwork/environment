export interface LensRay<T> {
    value: T
}

export interface LensChange<T, R extends LensRay<T> = LensRay<T>> {
    additions: Iterable<R>
    deletions: Iterable<R>
}

function isOpenable(value: unknown): value is { open: boolean } {
    function isOpenableLike(value: unknown): value is { open: unknown } {
        return !!value
    }
    return (
        isOpenableLike(value) &&
        typeof value.open === "boolean"
    )
}

function isAsyncIterable<TBind>(value: unknown): value is AsyncIterable<TBind> {
    function isAsyncIterableLike(value: unknown): value is { [Symbol.asyncIterator]: unknown } {
        return !!value
    }
    return (
        isAsyncIterableLike(value) &&
        typeof value[Symbol.asyncIterator] === "function"
    )
}

// If Iterable & AsyncIterable, must be C
export type LensSource<T, C extends LensChange<T> = LensChange<T>> = Iterable<T> | (Iterable<T> & AsyncIterable<C>)

export interface Lens<T, C extends LensChange<T> = LensChange<T>, S extends LensSource<T, C> = LensSource<T, C>> extends Iterable<T>, AsyncIterable<C> {
    open: boolean
}

export class Lens<T, C extends LensChange<T> = LensChange<T>, S extends LensSource<T, C> = LensSource<T, C>> implements Lens<T, C> {

    protected source?: S

    constructor(source?: S) {
        this.source = source
        if (isOpenable(source)) {
            Object.defineProperty(this, "open", {
                get(): boolean {
                    return source.open
                }
            })
        } else {
            // If we have an async iterable without an open boolean, then we will mark it as always open, hit the async iterator to know more
            this.open = isAsyncIterable(source)
        }
    }

    *[Symbol.iterator]() {
        if (this.source) {
            yield* this.source
        }
    }

    async *[Symbol.asyncIterator]() {
        if (isAsyncIterable<C>(this.source)) {
            yield* this.source
        }
    }
}

export function scalar<T>(lens: Lens<T>): T | undefined {
    const iterator = lens[Symbol.iterator]()
    const next = iterator.next()
    return next.done ? undefined : (next.value ?? undefined)
}

export function array<T>(lens: Lens<T>): T[] {
    return [...lens]
}

export async function* additions<T, C extends LensChange<T>>(lens: Lens<T, C>): AsyncIterable<C["additions"]> {
    for await (const { additions } of lens) {
        yield additions
    }
}

export async function* deletions<T, C extends LensChange<T>>(lens: Lens<T, C>): AsyncIterable<C["deletions"]> {
    for await (const { deletions } of lens) {
        yield deletions
    }
}

export async function onChange<T, C extends LensChange<T>>(lens: Lens<T, C>): Promise<C | undefined> {
    const iterator = lens[Symbol.asyncIterator]()
    const next = await iterator.next()
    return next.done ? undefined : (next.value ?? undefined)
}

export async function onAddition<T, C extends LensChange<T>>(lens: Lens<T, C>): Promise<C["additions"] | undefined> {
    const iterator = additions(lens)[Symbol.asyncIterator]()
    const next = await iterator.next()
    return next.done ? undefined : (next.value ?? undefined)
}

export async function onDeletion<T, C extends LensChange<T>>(lens: Lens<T, C>): Promise<C["deletions"] | undefined> {
    const iterator = additions(lens)[Symbol.asyncIterator]()
    const next = await iterator.next()
    return next.done ? undefined : (next.value ?? undefined)
}
