import {
    CompleteEventType,
    ConfigureEventType,
    dispatchEvent,
    ErrorEventType,
    ExecuteEventType
} from "../environment/environment"
import { getRuntimeEnvironment } from "./environment"
import { runWithSpan } from "../tracing/tracing";

export async function run() {
    const environment = await getRuntimeEnvironment()

    await environment.runInAsyncScope(async () => {

        await runWithSpan("environment", { attributes: { name: environment.name } }, async () => {

            await runWithSpan("environment_configure", {}, () => {
                if (environment.configure) {
                    environment.configure()
                }
            })

            await dispatchEvent({
                type: ConfigureEventType,
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
                    type: ExecuteEventType,
                    environment,
                    parallel: false
                })
                await runWithSpan("environment_wait_for_services", {}, () => environment.waitForServices())
            } catch (error) {
                await dispatchEvent({
                    type: ErrorEventType,
                    error
                })
            } finally {
                await dispatchEvent({
                    type: CompleteEventType,
                    environment
                })
            }

        })

    })
}
