import {Environment, setEnvironment, getEnvironment} from "../environment/environment"
import {isRunningCloudflare} from "./cloudflare/is-running"
import {isRunningNode} from "./node/is-running"
import {isRunningAWSLambda} from "./aws-lambda/is-running"
import {isRunningBrowser} from "./browser/is-running"
import {isRunningReactNative} from "./react-native/is-running"

export interface EnvironmentRuntimeDetail {
    getEnvironment?(): Environment | undefined
    environment: Environment
}

async function getRuntimeEnvironmentDetail(): Promise<EnvironmentRuntimeDetail> {
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

export async function getRuntimeEnvironment(): Promise<Environment> {
    const { environment, getEnvironment: getEnvironmentFn } = await getRuntimeEnvironmentDetail()
    const currentEnvironment = getEnvironment()

    if (currentEnvironment) {
        currentEnvironment.addEnvironment(environment)
    }

    if (!currentEnvironment && getEnvironmentFn) {
        setEnvironment(getEnvironmentFn)
    }

    return environment
}
