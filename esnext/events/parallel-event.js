import { isEvent } from "./event/event.js";
export function isParallelEvent(value) {
    return isEvent(value) && value.parallel !== false;
}
