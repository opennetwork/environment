import { addEventListener } from "../environment/environment.js";
export function render(fn) {
    addEventListener("render", event => event.render(fn));
}
