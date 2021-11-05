export function getPort(env: string, def?: number) {
    const value = process.env[env]
    if (!value || !/^\d+$/.test(value)) {
        return def
    }
    return +value
}

export function getEnabledFlags(): string[] {
    const flags = process.env["FLAGS"];
    return (flags ? flags.split(/[|,:]/).map(value => value.trim()).filter(Boolean) : [])
        .concat(getTrueEnv());
    function getTrueEnv() {
        return Object.entries(process.env)
            .filter(([, value]) => value === "true")
            .map(([key]) => key);
    }
}
