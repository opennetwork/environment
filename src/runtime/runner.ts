import {
    CompleteEventType,
    ConfigureEventType,
    dispatchEvent,
    ErrorEventType,
    ExecuteEventType
} from "../environment/environment"
import { getRuntimeEnvironment } from "./environment"

export async function run() {
    const environment = await getRuntimeEnvironment()

    await environment.runInAsyncScope(async () => {
        if (environment.configure) {
            await environment.configure()
        }

        await dispatchEvent({
            type: ConfigureEventType,
            environment,
            parallel: false
        })

        if (environment.postConfigure) {
            environment.postConfigure()
        }

        try {
            await dispatchEvent({
                type: ExecuteEventType,
                environment,
                parallel: false
            })
            await environment.waitForServices()
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
}
