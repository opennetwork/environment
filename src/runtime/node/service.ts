export function getPort(env: string, def?: number) {
    const value = process.env[env]
    if (!value || !/^\d+$/.test(value)) {
        return def
    }
    return +value
}
