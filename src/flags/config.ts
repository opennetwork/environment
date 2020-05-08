import { Environment, getEnvironment } from "../environment/environment"
import { Flag } from "./flag"

export interface FlagConfig {
    flag: Flag
    inheritDispatcherEvents: boolean
}

export interface FlagsConfig {
    flags: FlagConfig[]
}

const flags = new WeakMap<Environment, FlagsConfig>()

export function getFlagConfig() {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Event required to use FlagContext")
    }
    let config = flags.get(environment)
    if (!config) {
        config = {
            flags: []
        }
        flags.set(environment, config)
    }
    return config
}

export function ensureFlag(flag: Flag) {
    const config = getFlagConfig()
    const foundFlagIndex = config.flags.findIndex(
        config => config.flag === flag
    )
    if (foundFlagIndex > -1) {
        return
    }
    createFlag(flag)
}

export function createFlag(flag: Flag, inheritDispatcherEvents: boolean = true) {
    const config = getFlagConfig()
    const foundFlagIndex = config.flags.findIndex(
        config => config.flag === flag
    )
    if (foundFlagIndex > -1) {
        throw new Error("Flag already exists")
    }
    config.flags.push({
        flag,
        inheritDispatcherEvents
    })
}