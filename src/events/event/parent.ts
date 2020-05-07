import { Event } from "./event"
import { createLocalStorage } from "../../local-storage"

const localStorage = createLocalStorage<Event>()

export async function runWithParentEvent(event: Event, callback: () => void | Promise<void>) {
    return localStorage.run(event, callback)
}

export function getParentEvent() {
    return localStorage.getStore()
}
