import { Span, SpanOptions, SpanAttributes } from "@opentelemetry/api";
export declare function runWithSpanOptional(name: string, options: SpanOptions, callback: () => void | Promise<void>): Promise<void | Span>;
export declare function runWithSpan(name: string, options: SpanOptions, callback: () => void | Promise<void>): Promise<Span>;
export declare function getSpan(): Span | undefined;
export declare function trace(name: string, keyValuePairs?: SpanAttributes, timestamp?: number, span?: Span | undefined): void;
export declare function error(error: unknown, timestamp?: number, span?: Span | undefined): void;
