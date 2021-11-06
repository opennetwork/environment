import { setEnvironment, getEnvironment } from "../environment/environment.js";
import { isRunning as isRunningCloudflare } from "./cloudflare/is-running.js";
import { isRunning as isRunningNode } from "./node/is-running.js";
import { isRunning as isRunningAWSLambda } from "./aws-lambda/is-running.js";
import { isRunning as isRunningBrowser } from "./browser/is-running.js";
import { isRunning as isRunningReactNative } from "./react-native/is-running.js";
import { isRunning as isRunningDeno } from "./deno/is-running.js";
export async function getRuntimeEnvironmentDetail(config) {
    if (isRunningCloudflare()) {
        const { Environment } = await import("./cloudflare/cloudflare.js");
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        };
    }
    else if (isRunningDeno()) {
        const { Environment } = await import("./deno/deno.js");
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        };
    }
    else if (isRunningNode()) {
        if (isRunningAWSLambda(config)) {
            const { Environment } = await import("./aws-lambda/aws-lambda.js");
            return {
                getEnvironment: undefined,
                environment: new Environment()
            };
        }
        else {
            const { Environment } = await import("./node/node.js");
            return {
                getEnvironment: undefined,
                environment: new Environment()
            };
        }
    }
    else if (isRunningBrowser()) {
        const { Environment } = await import("./browser/browser.js");
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        };
    }
    else if (isRunningReactNative()) {
        const { Environment } = await import("./react-native/react-native.js");
        return {
            getEnvironment: Environment.getEnvironment,
            environment: new Environment()
        };
    }
    throw new Error("Unknown environment");
}
export async function getRuntimeEnvironment(config) {
    const { environment, getEnvironment: getEnvironmentFn } = await getRuntimeEnvironmentDetail(config);
    const currentEnvironment = getEnvironment();
    if (currentEnvironment) {
        currentEnvironment.addEnvironment(environment);
    }
    else if (getEnvironmentFn) {
        setEnvironment(getEnvironmentFn);
    }
    return environment;
}
