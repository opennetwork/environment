import {Environment, getEnvironment, dispatchEvent, ExecuteEvent} from "../environment/environment"
import { Event } from "../events/events"

declare global {

    interface EnvironmentConfig {
        environment?: Environment;
        execute?(event: ExecuteEvent): void | Promise<void>
    }

}

export interface ConfigUpdateEvent extends Event<"config:update"> {
    config: Readonly<EnvironmentConfig>
}

declare global {

    interface EnvironmentEvents {
        "config:update": ConfigUpdateEvent
    }
}

export {
    EnvironmentConfig
}

const config = new WeakMap<Environment, EnvironmentConfig>()

export function getEnvironmentConfig(): EnvironmentConfig {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to use EnvironmentConfig")
    }
    const environmentConfig = config.get(environment)
    if (!environmentConfig) {
        throw new Error("Environment not configured")
    }
    return environmentConfig
}

export async function setEnvironmentConfig(environmentConfig: EnvironmentConfig) {
    const environment = getEnvironment()
    if (!environment) {
        throw new Error("Environment required to use EnvironmentConfig")
    }
    config.set(environment, environmentConfig)
    const event: ConfigUpdateEvent = {
        type: "config:update",
        config: environmentConfig
    }
    await dispatchEvent(event)
}
