declare global {

    const Deno: {
        env: {
            get(name: string): string | undefined
            toObject(): Record<string, string>;
        };
    }
}

export function getEnabledFlags(): string[] {
    const flags = Deno.env.get("FLAGS");
    if (flags) return flags.split(/[|,:]/).map(value => value.trim()).filter(Boolean);
    try {
        const env = Deno.env.toObject();
        return Object.entries(env)
            .filter(([, value]) => value === "true")
            .map(([key]) => key);
    } catch {
        // Cannot access
        return [];
    }
}

export function getPort(env: string, def?: number) {
    const value = Deno.env.get(env);
    if (!value || !/^\d+$/.test(value)) {
        return def
    }
    return +value
}
