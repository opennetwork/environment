export interface Lens<T> extends Iterable<T>, AsyncIterable<[Iterable<T>, Iterable<T>]> {
    open: boolean
}

export class Lens<T> implements Lens<T> {

    readonly #staticSource: Iterable<T>

    constructor(staticSource: Iterable<T> = []) {
        this.#staticSource = staticSource
        this.open = false
    }

    *[Symbol.iterator]() {
        yield* this.#staticSource
    }

    async *[Symbol.asyncIterator](): AsyncIterableIterator<[Iterable<T>, Iterable<T>]> {
        // No additions or deletions, always static
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

export async function* additions<T>(lens: Lens<T>): AsyncIterable<Iterable<T>> {
    for await (const [additions] of lens) {
        yield additions
    }
}

export async function* deletions<T>(lens: Lens<T>): AsyncIterable<Iterable<T>> {
    for await (const [, deletions] of lens) {
        yield deletions
    }
}

export async function next<T>(lens: Lens<T>): Promise<[Iterable<T>, Iterable<T>] | undefined> {
    const iterator = lens[Symbol.asyncIterator]()
    const next = await iterator.next()
    return next.done ? undefined : (next.value ?? undefined)
}

export async function nextAddition<T>(lens: Lens<T>): Promise<Iterable<T> | undefined> {
    const iterator = additions(lens)[Symbol.asyncIterator]()
    const next = await iterator.next()
    return next.done ? undefined : (next.value ?? undefined)
}

export async function nextDeletion<T>(lens: Lens<T>): Promise<Iterable<T> | undefined> {
    const iterator = additions(lens)[Symbol.asyncIterator]()
    const next = await iterator.next()
    return next.done ? undefined : (next.value ?? undefined)
}
