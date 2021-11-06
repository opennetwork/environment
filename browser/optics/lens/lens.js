function isOpenable(value) {
    function isOpenableLike(value) {
        return !!value;
    }
    return (isOpenableLike(value) &&
        typeof value.open === "boolean");
}
function isAsyncIterable(value) {
    function isAsyncIterableLike(value) {
        return !!value;
    }
    return (isAsyncIterableLike(value) &&
        typeof value[Symbol.asyncIterator] === "function");
}
export class Lens {
    source;
    constructor(source) {
        this.source = source;
        if (isOpenable(source)) {
            Object.defineProperty(this, "open", {
                get() {
                    return source.open;
                }
            });
        }
        else {
            // If we have an async iterable without an open boolean, then we will mark it as always open, hit the async iterator to know more
            this.open = isAsyncIterable(source);
        }
    }
    *[Symbol.iterator]() {
        if (this.source) {
            yield* this.source;
        }
    }
    async *[Symbol.asyncIterator]() {
        if (isAsyncIterable(this.source)) {
            yield* this.source;
        }
    }
}
export function scalar(lens) {
    const iterator = lens[Symbol.iterator]();
    const next = iterator.next();
    return next.done ? undefined : (next.value ?? undefined);
}
export function array(lens) {
    return [...lens];
}
export async function* additions(lens) {
    for await (const { additions } of lens) {
        yield additions;
    }
}
export async function* deletions(lens) {
    for await (const { deletions } of lens) {
        yield deletions;
    }
}
export async function onChange(lens) {
    const iterator = lens[Symbol.asyncIterator]();
    const next = await iterator.next();
    return next.done ? undefined : (next.value ?? undefined);
}
export async function onAddition(lens) {
    const iterator = additions(lens)[Symbol.asyncIterator]();
    const next = await iterator.next();
    return next.done ? undefined : (next.value ?? undefined);
}
export async function onDeletion(lens) {
    const iterator = additions(lens)[Symbol.asyncIterator]();
    const next = await iterator.next();
    return next.done ? undefined : (next.value ?? undefined);
}
