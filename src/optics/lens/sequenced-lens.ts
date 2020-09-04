import {Lens, LensChange, LensRay} from "./lens";

export interface SequencedLensRay<T> extends LensRay<T> {
    sequence: number
}

export interface SequencedLens<T, C extends LensChange<T, SequencedLensRay<T>> = LensChange<T, SequencedLensRay<T>>> extends Lens<T, C> {
    sequenced: true
}

export function isSequencedLens<T, C extends LensChange<T>>(lens: Lens<T, C>): lens is SequencedLens<T, C & LensChange<T, SequencedLensRay<T>>> {
    function isSequencedLensLike(value: unknown): value is { sequenced: unknown } {
        return !!value
    }
    return (
        isSequencedLensLike(lens) &&
        lens.sequenced === true
    )
}
