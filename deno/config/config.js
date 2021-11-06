import { getEnvironment, dispatchEvent } from "../environment/environment.js";
const config = new WeakMap();
export function getEnvironmentConfig() {
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required to use EnvironmentConfig");
    }
    const environmentConfig = config.get(environment);
    if (!environmentConfig) {
        throw new Error("Environment not configured");
    }
    return environmentConfig;
}
export async function setEnvironmentConfig(environmentConfig) {
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required to use EnvironmentConfig");
    }
    config.set(environment, environmentConfig);
    const event = {
        type: "config:update",
        config: environmentConfig
    };
    await dispatchEvent(event);
}
