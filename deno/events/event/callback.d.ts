import { Event } from "./event";
import { EventDescriptor } from "./descriptor";
export interface SyncEventCallback<TargetEvent = unknown, This = unknown> {
    (this: This, event: TargetEvent): void;
}
export interface EventCallback<TargetEvent extends Event = Event, This = unknown> {
    (this: This, event: TargetEvent): Promise<void> | void;
}
export declare function matchEventCallback(type: string, callback?: EventCallback): (descriptor: EventDescriptor) => boolean;
