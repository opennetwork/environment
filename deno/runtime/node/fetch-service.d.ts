import { Request, Response } from "@opennetwork/http-representation";
import { Event } from "../../events/events";
import { MeterProvider, MetricExporter } from "@opentelemetry/metrics";
export interface FetchEvent extends Event<"fetch"> {
    request: Request;
    respondWith(response: Response | Promise<Response>): void;
    waitUntil(promise: Promise<unknown>): Promise<void>;
}
declare global {
    interface EnvironmentEvents {
        fetch: FetchEvent;
    }
}
export interface FetchServiceConfig {
    port: number;
    onListener?: boolean;
    baseUrl?: string;
    timeout?: number | boolean;
    meter?: string;
    meterProvider?: MeterProvider;
    meterExporter?: MetricExporter;
}
export declare function start(): Promise<void>;
