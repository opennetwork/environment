import {
    CompleteEventType,
    ConfigureEventType,
    dispatchEvent,
    Environment,
    ExecuteEventType,
    setEnvironment
} from "../environment/environment"
import {isRunningNode} from "./node/is-running"
import {isRunningAWSLambda} from "./aws-lambda/is-running"
import {isRunningBrowser} from "./browser/is-running"
import {isRunningReactNative} from "./react-native/is-running"
import {isRunningCloudflare} from "./cloudflare/is-running";

async function getRuntimeEnvironment(): Promise<{ getEnvironment?(): Environment | undefined, environment: Environment }> {
    if (isRunningCloudflare()) {
        const { Environment } = await import("./cloudflare/cloudflare")
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        }
    } else if (isRunningNode()) {
        if (isRunningAWSLambda()) {
            const { Environment } = await import("./aws-lambda/aws-lambda")
            return {
                getEnvironment: Environment.getEnvironment,
                environment: new Environment()
            }
        } else {
           const { Environment } = await import("./node/node")
            return {
               getEnvironment: Environment.getEnvironment,
               environment: new Environment()
            }
        }
    } else if (isRunningBrowser()) {
        const { Environment } = await import("./browser/browser")
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        }
    } else if (isRunningReactNative()) {
        const { Environment } = await import("./react-native/react-native")
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        }
    }
    throw new Error("Unknown environment")
}

export async function run() {
    // Basic environment setup
    const { environment, getEnvironment } = await getRuntimeEnvironment()

    if (getEnvironment) {
        setEnvironment(getEnvironment)
    }

    if (environment.configure) {
        await environment.configure()
    }

    await dispatchEvent({
        type: ConfigureEventType,
        environment
    })

    await dispatchEvent({
        type: ExecuteEventType,
        environment
    })

    await dispatchEvent({
        type: CompleteEventType,
        environment
    })
}
