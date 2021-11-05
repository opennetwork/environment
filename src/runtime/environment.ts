import {Environment, setEnvironment, getEnvironment} from "../environment/environment"
import {isRunning as isRunningCloudflare} from "./cloudflare/is-running"
import {isRunning as isRunningNode} from "./node/is-running"
import {isRunning as isRunningAWSLambda} from "./aws-lambda/is-running"
import {isRunning as isRunningBrowser} from "./browser/is-running"
import {isRunning as isRunningReactNative} from "./react-native/is-running"
import {isRunning as isRunningDeno} from "./deno/is-running"
import {getEnv} from "@virtualstate/examples/lib/log.util";

export interface EnvironmentRuntimeDetail {
    getEnvironment?(): Environment | undefined
    environment: Environment
}

export async function getRuntimeEnvironmentDetail(config: EnvironmentConfig): Promise<EnvironmentRuntimeDetail> {
    if (isRunningCloudflare()) {
        const { Environment } = await import("./cloudflare/cloudflare")
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        }
    } else if (isRunningDeno()) {
        const { Environment } = await import("./deno/deno")
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        }
    } else if (isRunningNode()) {
        if (isRunningAWSLambda(config)) {
            const { Environment } = await import("./aws-lambda/aws-lambda")
            return {
                getEnvironment: undefined,
                environment: new Environment()
            }
        } else {
            const { Environment } = await import("./node/node")
            return {
                getEnvironment: undefined,
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

export async function getRuntimeEnvironment(config: EnvironmentConfig): Promise<Environment> {
    const { environment, getEnvironment: getEnvironmentFn } = await getRuntimeEnvironmentDetail(config)
    const currentEnvironment = getEnvironment()

    if (currentEnvironment) {
        currentEnvironment.addEnvironment(environment)
    } else if (getEnvironmentFn) {
        setEnvironment(getEnvironmentFn);
    }

    return environment
}
