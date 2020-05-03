import { isRunningNode } from "../node/is-running";

export function isRunningAWSLambda() {
    return isRunningNode() && process.env.LAMBDA_ENV === "true"
}
