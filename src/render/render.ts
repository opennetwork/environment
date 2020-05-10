import { RenderFunction } from "./render-function"
import { addEventListener } from "../environment/environment"
import { Event } from "../events/events";

export interface RenderEvent extends Event<"render"> {
    render(fn: RenderFunction): Promise<void>
}

declare global {

    interface EnvironmentEvents {
        render: RenderEvent
    }

}

export function render(fn: RenderFunction) {
    addEventListener("render", event => event.render(fn))
}
