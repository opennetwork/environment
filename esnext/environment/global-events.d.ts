import { Event as InternalEvent } from "../events/event/event";
export declare const addGlobalEventListener: typeof addEventListener | undefined;
export declare const removeGlobalEventListener: typeof removeEventListener | undefined;
export declare const dispatchGlobalEvent: ((event: InternalEvent<string>) => boolean) | undefined;
