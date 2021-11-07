import { Event } from "./event";
import { EventDescriptor } from "./descriptor";
export interface DispatchedEvent {
    descriptor?: EventDescriptor;
    event: Event;
    target: unknown;
    timestamp: number;
}
export interface EventListener {
    isListening(): boolean;
    descriptor: EventDescriptor;
    timestamp: number;
}
export interface EventContext {
    dispatcher: Event | undefined;
    listeners: EventListener[];
    dispatchedEvents: DispatchedEvent[];
}
export declare function hasEventContext(event: Event): boolean;
export declare function getEventContext(event: Event): EventContext;
