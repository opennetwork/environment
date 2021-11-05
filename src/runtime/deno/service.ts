declare global {

    const Deno: {
        env: {
            get(name: string): string | undefined
        };
    }
}

export function getPort(env: string, def?: number) {
    const value = Deno.env.get(env);
    if (!value || !/^\d+$/.test(value)) {
        return def
    }
    return +value
}
