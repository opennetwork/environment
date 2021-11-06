import { Event } from "./event";
export declare function runWithEvent(event: Event, callback: () => void | Promise<void>): Promise<void>;
export declare function getEvent(): Event<string>;
export declare function getDispatcherEvents(event?: Event | undefined): Event[];
