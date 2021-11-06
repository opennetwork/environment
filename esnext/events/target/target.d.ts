import { Event } from "../event/event";
import { Environment } from "../../environment/environment";
import { EventCallback, SyncEventCallback } from "../event/callback";
export { EventCallback };
export interface SyncEventTarget<Event = unknown, This = unknown> {
    addEventListener(type: string, callback: SyncEventCallback<Event, This>): void;
    removeEventListener(type: string, callback: SyncEventCallback<Event, This>): void;
    dispatchEvent(event: Event): void;
}
export interface EventTarget<This = unknown> extends SyncEventTarget<Event, This> {
    addEventListener(type: string, callback: EventCallback<Event, This>): void;
    removeEventListener(type: string, callback: Function): void;
    dispatchEvent(event: Event): void | Promise<void>;
    hasEventListener(type: string, callback?: Function): Promise<boolean>;
}
export declare type AddEventListenerFn = EventTarget["addEventListener"];
export declare type RemoveEventListenerFn = EventTarget["removeEventListener"];
export declare type DispatchEventListenerFn = EventTarget["dispatchEvent"];
export declare type HasEventListenerFn = EventTarget["hasEventListener"];
export declare class EventTarget implements EventTarget {
    #private;
    constructor(thisValue?: unknown, environment?: Environment | undefined);
}
export declare function isSignalHandled(event: Event, error: unknown): true | undefined;
