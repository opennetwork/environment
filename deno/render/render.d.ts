import { RenderFunction } from "./render-function";
import { Event } from "../events/events";
import { VNode } from "@virtualstate/fringe";
export interface RenderEvent extends Event<"render"> {
    render(fn: RenderFunction | VNode): void | Promise<void>;
    signal: AbortSignal;
}
declare global {
    interface EnvironmentEvents {
        render: RenderEvent;
    }
}
export declare function render(fn: RenderFunction): void;
