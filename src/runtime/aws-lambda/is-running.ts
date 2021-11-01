import { isRunning as isRunningNode } from "../node/is-running"

export function isRunning() {
    return isRunningNode() && process.env.LAMBDA_ENV === "true"
}
