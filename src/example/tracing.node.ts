// deno-lint-ignore-file

export async function install() {
    const { Metadata, credentials } = await import("@grpc/grpc-js");
    const {
        HONEYCOMB_API_KEY: apiKey,
        HONEYCOMB_DATASET: dataSet,
        HONEYCOMB_SERVICE_NAME: serviceName
    } = process.env;
    if (!(apiKey && dataSet && serviceName)) return;

    const {NodeSDK} = await import('@opentelemetry/sdk-node');
    const {getNodeAutoInstrumentations} = await import('@opentelemetry/auto-instrumentations-node');
    const {Resource} = await import('@opentelemetry/resources');
    const {SemanticResourceAttributes} = await import('@opentelemetry/semantic-conventions');
    const {CollectorTraceExporter} = await import("@opentelemetry/exporter-collector-grpc");

    const metadata = new Metadata()
    metadata.set('x-honeycomb-team', apiKey);
    metadata.set('x-honeycomb-dataset', dataSet);
    const traceExporter = new CollectorTraceExporter({
        url: 'grpc://api.honeycomb.io:443/',
        credentials: credentials.createSsl(),
        metadata
    });

    const sdk = new NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
        traceExporter,
        instrumentations: [getNodeAutoInstrumentations()]
    });

    await sdk.start();

    console.log('Tracing initialized');

    process.on('SIGTERM', () => {
        sdk.shutdown()
            .then(() => console.log('Tracing terminated'))
            .catch((error) => console.log('Error terminating tracing', error))
            .finally(() => process.exit(0));
    });
}
