import {dispatchEvent, ExecuteEvent, hasEventListener} from "../environment/environment"
import { getRuntimeEnvironment } from "./environment"
import { runWithSpan } from "../tracing/tracing"
import { EnvironmentConfig, setEnvironmentConfig } from "../config/config"
import { hasFlag } from "../flags/flags";

export async function run(config: EnvironmentConfig) {
    const errors: unknown[] = [];
    try {
        const environment = await getRuntimeEnvironment(config)
        await environment.runInAsyncScope(async () => {
            await setEnvironmentConfig(config)

            await runWithSpan("environment", { attributes: { name: environment.name } }, async () => {

                await runWithSpan("environment_configure", {}, async () => {
                    if (environment.configure) {
                        environment.configure()
                    }
                })

                await dispatchEvent({
                    type: "install",
                    environment,
                    parallel: false
                })

                await dispatchEvent({
                    type: "configure",
                    environment,
                    parallel: false
                })

                await runWithSpan("environment_post_configure", {}, () => {
                    if (environment.postConfigure) {
                        environment.postConfigure()
                    }
                })

                if (hasFlag("POST_CONFIGURE_TEST") && await hasEventListener("test")) {
                    try {
                        await dispatchEvent({
                            type: "test",
                            environment,
                            parallel: false
                        });
                        console.error({ tests: "pass" });
                    } catch (error) {
                        console.error({ runnerTestError: error });
                        await Promise.reject(error);
                    }
                }

                try {
                    const event: ExecuteEvent = {
                        type: "execute",
                        environment,
                        parallel: false
                    };
                    await dispatchEvent(event);
                    if (config.execute) {
                        await config.execute(event);
                    }
                    await runWithSpan("environment_wait_for_services", {}, () => environment.waitForServices())
                } catch (error) {
                    errors.push(error);
                    if (await hasEventListener("error")) {
                        await dispatchEvent({
                            type: "error",
                            error
                        })
                    } else {
                        console.error(error);
                    }
                } finally {
                    await dispatchEvent({
                        type: "complete",
                        environment
                    })
                    if (environment.end) {
                        await environment.end()
                    }
                }

            })

        })
    } catch (error) {
        console.error(error)
        errors.push(error);
    }
    console.log({ errors });
    if (errors.length === 1) {
        // Bypass throw, retain original error stack
        await Promise.reject(errors[0]);
        throw "Unexpected resolution"; // We shouldn't be able to get here ever.
    } else if (errors.length > 1) {
        throw new AggregateError(errors);
    }
}
