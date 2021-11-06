// import { NodeSDK, tracing } from "https://cdn.skypack.dev/@opentelemetry/sdk-node";
// import { getNodeAutoInstrumentations } from "https://cdn.skypack.dev/@opentelemetry/auto-instrumentations-node";
import { addEventListener } from "../../environment/environment.js";
// Top level, rather than inside a configure
addEventListener("configure", async () => {
    // const sdk = new NodeSDK({
    //     traceExporter: new tracing.ConsoleSpanExporter(),
    //     instrumentations: [getNodeAutoInstrumentations()]
    // });
    //
    // await sdk.start();
    // const { JaegerExporter } = await import("@opentelemetry/exporter-jaeger");
    // const { PrometheusExporter } = await import("@opentelemetry/exporter-prometheus");
    // const { BatchSpanProcessor } = await import("@opentelemetry/tracing");
    //
    // sdk.configureMeterProvider({
    //     exporter: new PrometheusExporter()
    // });
});
