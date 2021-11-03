import {dispatchEvent, getEnvironment, setEnvironment} from "../environment/environment"
import { getRuntimeEnvironment } from "./environment"
import { runWithSpan } from "../tracing/tracing"
import { EnvironmentConfig, setEnvironmentConfig } from "../config/config"

export async function run(config: EnvironmentConfig) {
    try {
        const environment = await getRuntimeEnvironment()

        await environment.runInAsyncScope(async () => {

            await runWithSpan("environment", { attributes: { name: environment.name } }, async () => {

                await runWithSpan("environment_configure", {}, async () => {
                    if (environment.configure) {
                        environment.configure()
                        await setEnvironmentConfig(config)
                    }
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

                try {
                    await dispatchEvent({
                        type: "execute",
                        environment,
                        parallel: false
                    })
                    await runWithSpan("environment_wait_for_services", {}, () => environment.waitForServices())
                } catch (error) {
                    console.error({ error })
                    await dispatchEvent({
                        type: "error",
                        error
                    })
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
        throw error
    }
}
