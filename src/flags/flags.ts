import {Event, getDispatcherEvents, getEvent} from "../events/events"
import { Flag } from "./flag"
import { getFlagConfig } from "./config"
import { Environment, getEnvironment } from "../environment/environment"

export * from "./config"
export * from "./flag"

const environmentFlags = new WeakMap<Environment, Set<Flag>>()
const eventFlags = new WeakMap<Event, Set<Flag>>()

export function hasFlag(flag: Flag) {
    // If environment has been flagged, then we are good to go, this is the default way to flag
    if (hasEnvironmentFlag()) {
        return true
    }
    const event = getEvent()
    if (!event) {
        return false
    }
    if (hasEventFlag(event)) {
        return true
    }
    const config = getFlagConfig()
    const flagConfig = config.flags.find(config => config.flag === flag)
    if (!(flagConfig && flagConfig.inheritDispatcherEvents)) {
        return false
    }
    const dispatcherEvents = getDispatcherEvents(event)
    for (const dispatcherEvent of dispatcherEvents) {
        if (hasEventFlag(dispatcherEvent)) {
            return true
        }
    }

    function hasEnvironmentFlag() {
        const environment = getEnvironment()
        if (!environment) {
            return false
        }
        const flags = environmentFlags.get(environment)
        return !!(flags && flags.has(flag))
    }

    function hasEventFlag(event: Event) {
        const flags = eventFlags.get(event)
        return !!(flags && flags.has(flag))
    }
}

export function setEventFlag(event: Event, flag: Flag) {
    let flags = eventFlags.get(event)
    if (!flags) {
        flags = new Set<Flag>()
        eventFlags.set(event, flags)
    }
    flags.add(flag)
}

export function removeEventFlag(event: Event, flag: Flag) {
    const flags = eventFlags.get(event)
    if (!flags) {
        return
    }
    flags.delete(flag)
}

export function setFlag(flag: Flag) {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to set flag")
    }

    const event = getEvent()
    if (event) {
        setEventFlag(event, flag)
    }

    let flags = environmentFlags.get(environment)
    if (!flags) {
        flags = new Set<Flag>()
        environmentFlags.set(environment, flags)
    }
    flags.add(flag)
}

export function removeFlag(flag: Flag) {
    const environment = getEnvironment()
    if (!environment) {
        return
    }

    const event = getEvent()

    if (event) {
        removeEventFlag(event, flag)
        const dispatcherEvents = getDispatcherEvents(event)
        dispatcherEvents.forEach(event => removeEventFlag(event, flag))
    }

    const flags = environmentFlags.get(environment)
    if (!flags) {
        return
    }
    flags.delete(flag)

}
