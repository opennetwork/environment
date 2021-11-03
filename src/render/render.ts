import { RenderFunction } from "./render-function"
import { addEventListener } from "../environment/environment"
import { Event } from "../events/events";
import { VNode } from "@virtualstate/fringe";

export interface RenderEvent extends Event<"render"> {
    render(fn: RenderFunction | VNode): void | Promise<void>
    signal: AbortSignal
}

declare global {

    interface EnvironmentEvents {
        render: RenderEvent
    }

}

export function render(fn: RenderFunction) {
    addEventListener("render", event => event.render(fn))
}
