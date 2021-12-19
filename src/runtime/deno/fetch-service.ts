import { getPort } from "./service";
import {
    addEventListener, getEnvironment,
    hasEventListener
} from "../../environment/environment"
import { hasFlag } from "../../flags/flags"
import { getEnvironmentConfig, setEnvironmentConfig } from "../../config/config"
import { dispatchFetchEvent } from "../../fetch/fetch";
import { listenAndServe } from "deno:std/http/server";
import { Request } from "@opennetwork/http-representation";

export interface FetchServiceConfig {
    port: number
    onListener?: boolean
    baseUrl?: string
    timeout?: number | boolean
}

addEventListener("configure", async () => {
    const config = getEnvironmentConfig()

    if (config.fetchService) {
        return
    }

    const port = getPort("FETCH_SERVICE_PORT")

    await setEnvironmentConfig({
        ...config,
        fetchService: {
            port: port ?? 8080,
            onListener: hasFlag("FETCH_SERVICE_ON_LISTENER"),
            timeout: hasFlag("FETCH_SERVICE_ABORT_ON_TIMEOUT")
        }
    })
})

export async function start(): Promise<void> {
    const config = getEnvironmentConfig()
    const environment = getEnvironment();

    // console.log("Start fetch service", config.fetchService);

    if (!config.fetchService || hasFlag("FETCH_SERVICE_DISABLE")) {
        return
    }

    const { port, onListener, timeout: abortTimeout } = config.fetchService

    if (onListener) {
        const hasListeners = await hasEventListener("fetch")

        if (!hasListeners) {
            // No need to configure, no one is going to hears
            return
        }
    }

    await listenAndServe(`:${port}`, async (request) => {
        const [, response] = await dispatchFetchEvent({
            request: new Request(request.url, {
                body: request.body,
                headers: request.headers,
                method: request.method
            }),
            type: "fetch",
            abortTimeout,
            environment
        });
        const { body, status, statusText, headers } = await response;
        return new Response(body, {
            status,
            statusText,
            headers: [
                ...headers.entries()
            ]
        });
    }).catch(console.error);

    console.log("Listen and serve complete");
}
