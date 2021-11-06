import { Event } from "./event/event";
import { SyncEventTarget } from "./target/target";
import { SyncEventCallback } from "./event/callback";
export interface AbortSignal extends SyncEventTarget {
    aborted: boolean;
    addEventListener(type: "abort", callback: SyncEventCallback): void;
    addEventListener(type: string, callback: SyncEventCallback): void;
}
export interface AbortController {
    signal: AbortSignal;
    abort(): void;
}
export interface SignalEvent<Name extends string = string> extends Event<Name> {
    signal: AbortSignal;
}
export declare function isAbortSignal(value: unknown): value is AbortSignal;
export declare function isAbortController(value: unknown): value is AbortController;
export declare function isSignalEvent(value: object): value is SignalEvent;
