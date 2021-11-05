import { isRunning as isRunningNode } from "../node/is-running"

export function isRunning(config: EnvironmentConfig) {
    return isRunningNode() && config.AWS_LAMBDA;
}
