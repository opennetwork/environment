export function getEnabledFlags() {
    const flags = Deno.env.get("FLAGS");
    return (flags ? flags.split(/[|,:]/).map(value => value.trim()).filter(Boolean) : [])
        .concat(getTrueEnv());
    function getTrueEnv() {
        try {
            const env = Deno.env.toObject();
            return Object.entries(env)
                .filter(([, value]) => value === "true")
                .map(([key]) => key);
        }
        catch {
            // Cannot access
            return [];
        }
    }
}
export function getPort(env, def) {
    try {
        const value = Deno.env.get(env);
        if (!value || !/^\d+$/.test(value)) {
            return def;
        }
        return +value;
    }
    catch {
        return def;
    }
}
