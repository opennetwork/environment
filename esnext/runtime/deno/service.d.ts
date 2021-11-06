declare global {
    const Deno: {
        env: {
            get(name: string): string | undefined;
            toObject(): Record<string, string>;
        };
    };
}
export declare function getEnabledFlags(): string[];
export declare function getPort(env: string, def?: number): number | undefined;
