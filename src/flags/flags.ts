import { Flag } from "./flag"
import { Environment, getEnvironment } from "../environment/environment"

export * from "./config"
export * from "./flag"

const environmentFlags = new WeakMap<Environment, Set<Flag>>()

export function hasFlag(flag: Flag) {
    const environment = getEnvironment()
    if (!environment) {
        return false
    }
    const flags = environmentFlags.get(environment)
    return !!(flags && flags.has(flag))
}

export function setFlag(flag: Flag) {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to set flag")
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
    const flags = environmentFlags.get(environment)
    if (!flags) {
        return
    }
    flags.delete(flag)

}
