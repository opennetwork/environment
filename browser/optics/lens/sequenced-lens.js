export function isSequencedLens(lens) {
    function isSequencedLensLike(value) {
        return !!value;
    }
    return (isSequencedLensLike(lens) &&
        lens.sequenced === true);
}
