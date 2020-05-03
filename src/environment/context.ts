import {getEnvironment} from "./environment"

export const EnvironmentContextSymbol = Symbol("Environment Context")

declare interface EnvironmentContext {
    type: typeof EnvironmentContextSymbol
    [key: string]: unknown
    [key: number]: unknown
}

export {
    EnvironmentContext
}

export function createEnvironmentContext(): EnvironmentContext {
    return {
        type: EnvironmentContextSymbol
    }
}

export function getEnvironmentContext(): EnvironmentContext | undefined {
    const environment = getEnvironment()
    return environment ? environment.context : undefined
}
