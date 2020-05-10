import {Environment, getEnvironment} from "./environment"

export const EnvironmentContextSymbol = Symbol("Environment Context")

declare global {

    interface EnvironmentContext {
        type: typeof EnvironmentContextSymbol
        [key: string]: unknown
        [key: number]: unknown
    }

}

export {
    EnvironmentContext
}

export function createEnvironmentContext(): EnvironmentContext {
    return {
        type: EnvironmentContextSymbol
    }
}

const globalEnvironmentContext = new WeakMap<Environment, EnvironmentContext>()

export function getEnvironmentContext(environment: Environment | undefined = getEnvironment()) {
    if (!environment) {
        throw new Error("Environment required for EnvironmentContext")
    }

    let environmentEventContext = globalEnvironmentContext.get(environment)
    if (!environmentEventContext) {
        environmentEventContext = createEnvironmentContext()
        globalEnvironmentContext.set(environment, environmentEventContext)
    }

    return environmentEventContext
}
