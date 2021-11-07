export interface FetchServiceConfig {
    port: number;
    onListener?: boolean;
    baseUrl?: string;
    timeout?: number | boolean;
}
export declare function start(): Promise<void>;
