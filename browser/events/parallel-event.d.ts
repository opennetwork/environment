import { Event } from "./event/event";
export interface ParallelEvent<Name extends string = string> extends Event<Name> {
    parallel: true | undefined;
}
export declare function isParallelEvent(value: object): value is ParallelEvent;
