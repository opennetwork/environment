// import { NodeSDK, tracing } from "@opentelemetry/sdk-node";
// import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { addEventListener } from "../../environment/environment";

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
