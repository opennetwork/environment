import { getPort } from "./service.js";
import { createServer } from "./resolve/nop.js";
import { dispatchEvent, addEventListener, hasEventListener, getEnvironment } from "../../environment/environment.js";
import { fromRequest, sendResponse } from "https://cdn.skypack.dev/@opennetwork/http-representation-node";
import { runWithSpan, trace, error as traceError } from "../../tracing/span.js";
import AbortController from "https://cdn.skypack.dev/abort-controller";
import { hasFlag } from "../../flags/flags.js";
import { getEnvironmentConfig, setEnvironmentConfig } from "../../config/config.js";
import { dispatchFetchEvent } from "../../fetch/fetch.js";
import { ConsoleMetricExporter, MeterProvider } from "https://cdn.skypack.dev/@opentelemetry/metrics";
addEventListener("configure", async () => {
    const config = getEnvironmentConfig();
    if (config.fetchService) {
        return;
    }
    const port = getPort("FETCH_SERVICE_PORT");
    if (!port) {
        return;
    }
    let baseUrl = process.env.FETCH_SERVICE_BASE_URL;
    if (!baseUrl) {
        baseUrl = "https://fetch.spec.whatwg.org";
    }
    await setEnvironmentConfig({
        ...config,
        fetchService: {
            port,
            baseUrl,
            onListener: hasFlag("FETCH_SERVICE_ON_LISTENER"),
            timeout: hasFlag("FETCH_SERVICE_ABORT_ON_TIMEOUT"),
            // meter: 'external -> internal fetch'
        }
    });
});
export async function start() {
    const config = getEnvironmentConfig();
    const environment = getEnvironment();
    if (!config.fetchService) {
        return;
    }
    const { port, onListener, timeout: abortTimeout, baseUrl, meter: meterName, meterExporter, meterProvider } = config.fetchService;
    if (onListener) {
        const hasListeners = await hasEventListener("fetch");
        if (!hasListeners) {
            // No need to configure, no one is going to hears
            return;
        }
    }
    const meter = meterName ? (meterProvider ??
        new MeterProvider({
            exporter: meterExporter ?? new ConsoleMetricExporter(),
            interval: 1000
        })).getMeter(meterName) : undefined;
    const requestCount = meter?.createCounter("requests", {
        description: "Count all incoming requests"
    });
    const boundInstruments = requestCount ? new Map() : undefined;
    const server = createServer(onRequestResponsePair);
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, () => {
            server.removeListener("error", reject);
            resolve();
        });
    });
    addEventListener("complete", close);
    return new Promise(resolve => server.once("close", resolve));
    function onRequestResponsePair(request, response) {
        const httpRequest = fromRequest(request, baseUrl);
        const attributes = {
            "http.url": httpRequest.url,
            "http.method": httpRequest.method
        };
        // Top level errors returned from the promise here will end up with the default
        // global error process with Node.js
        // https://nodejs.org/api/process.html#event-unhandledrejection
        void runWithSpan("request", { attributes }, run).catch(async (error) => {
            traceError(error);
            let errorHandled = false;
            if (await hasEventListener("fetch-error")) {
                await dispatchEvent({
                    type: "fetch-error",
                    error,
                    rawResponse: response
                });
                errorHandled = true;
            }
            else if (await hasEventListener("error")) {
                await dispatchEvent({
                    type: "error",
                    error,
                    rawResponse: response
                });
                errorHandled = true;
            }
            try {
                response.writeHead(500);
                response.end();
            }
            catch (error) {
                void error;
            }
            if (!errorHandled) {
                return Promise.reject(error);
            }
        });
        function getBoundCounter(url) {
            if (!boundInstruments || !requestCount)
                return undefined;
            const { pathname, host, protocol } = new URL(url);
            const key = `${protocol}://${host}${pathname}`;
            const foundCounter = boundInstruments.get(key);
            if (foundCounter) {
                return foundCounter;
            }
            const labels = { pathname, host, protocol };
            const counter = requestCount.bind(labels);
            boundInstruments.set(key, counter);
            return counter;
        }
        async function run() {
            const counter = getBoundCounter(httpRequest.url);
            counter?.add(1);
            const controller = new AbortController();
            environment.addAbortController(controller);
            request.on("abort", () => controller.abort());
            request.on("close", () => controller.abort());
            const [event, responsePromise] = await dispatchFetchEvent({
                request: httpRequest,
                abortTimeout,
                signal: controller.signal,
                type: "fetch",
                environment,
            });
            try {
                const httpResponse = await responsePromise;
                trace("response", {
                    "http.status": httpResponse.status
                });
                await sendResponse(httpResponse, httpRequest, response);
                trace("request_end");
            }
            finally {
                abort("finally");
                // Ensure the promise is completed if it is still in play
                event.respondWith(Promise.reject(new Error("Response no longer required")));
            }
            function abort(reason) {
                if (controller.signal.aborted) {
                    // Already aborted, no need to do it again!
                    return;
                }
                if (reason) {
                    trace("signal_aborted", {
                        reason
                    });
                }
                controller.abort();
            }
        }
    }
    async function close() {
        return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
}
