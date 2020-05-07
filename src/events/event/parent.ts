import { Event } from "./event"
import { createLocalStorage } from "../../local-storage"
import {getEnvironment} from "../../environment/environment";

const localStorage = createLocalStorage<Event>()

export async function runWithParentEvent(event: Event, callback: () => void | Promise<void>) {
    return localStorage.run(event, callback)
}

export function getParentEvent() {
    const environment = getEnvironment()
    if (!environment) {
        return undefined
    }
    return localStorage.getStore()
}
