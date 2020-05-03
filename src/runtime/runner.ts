import {isRunningNode} from "./node/is-running";
import {isRunningAWSLambda} from "./aws-lambda/is-running";
import {
    ConfigureEventType,
    dispatchEvent,
    Environment,
    ExecuteEventType,
    setEnvironment
} from "../environment/environment"
import {isRunningBrowser} from "./browser/is-running";

async function getRuntimeEnvironment(): Promise<Environment> {
    if (isRunningNode()) {
        if (isRunningAWSLambda()) {
            const { Environment } = await import("./aws-lambda/aws-lambda")
            return new Environment()
        } else {
           const { Environment } = await import("./node/node")
            return new Environment()
        }
    } else if (isRunningBrowser()) {
        const { Environment } = await import("./browser/browser")
        return new Environment()
    }
    throw new Error("Unknown environment")
}

export async function run() {
    // Basic environment setup
    const environment: Environment = await getRuntimeEnvironment()

    const { getEnvironment } = Object.getPrototypeOf(environment).constructor

    if (getEnvironment) {
        setEnvironment(getEnvironment)
    }

    await dispatchEvent({
        type: ConfigureEventType,
        environment
    })

    await dispatchEvent({
        type: ExecuteEventType,
        environment
    })
}
