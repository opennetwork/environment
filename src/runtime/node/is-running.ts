export function isRunningNode() {
    return (typeof process !== 'undefined') && (process.release.name === 'node')
}
