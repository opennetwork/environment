import { RenderFunction } from "./render-function"
import { addEventListener } from "../environment/environment"

export function render(fn: RenderFunction) {
    addEventListener("render", event => event.render(fn))
}
