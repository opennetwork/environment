export function isRunning() {
    return (typeof process !== 'undefined') && (process.release.name === 'node')
}
