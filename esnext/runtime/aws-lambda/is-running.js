import { isRunning as isRunningNode } from "../node/is-running.js";
export function isRunning(config) {
    return isRunningNode() && config.AWS_LAMBDA;
}
