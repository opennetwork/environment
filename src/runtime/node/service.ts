export function getPort(env: string) {
    const value = process.env[env]
    if (!value || !/^\d+$/.test(value)) {
        return undefined
    }
    return +value
}
