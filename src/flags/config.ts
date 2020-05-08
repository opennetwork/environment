import { Environment, getEnvironment } from "../environment/environment"
import { Flag } from "./flag"

const flags = new WeakMap<Environment, Set<Flag>>()

export function getFlags() {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to use FlagContext")
    }
    let set = flags.get(environment)
    if (!set) {
        set = new Set<Flag>()
        flags.set(environment, set)
    }
    return set
}

export function ensureFlag(flag: Flag) {
    if (getFlags().has(flag)) {
        return
    }
    createFlag(flag)
}

export function createFlag(flag: Flag) {
    const set = getFlags()
    if (set.has(flag)) {
        throw new Error("Flag already exists")
    }
    set.add(flag)
}

export function resetFlag(flag: Flag) {
    const set = getFlags()
    if (!set.has(flag)) {
        return
    }
    set.delete(flag)
}