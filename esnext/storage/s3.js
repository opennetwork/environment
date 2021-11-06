import { Store } from "./store/store.js";
import { JSONStore } from "./json.js";
function s3Store(options) {
    return new JSONStore({
        base: {
            async get(key) {
                const { Body } = await options.interface.getObject({
                    Bucket: options.bucket,
                    Key: getKey(key)
                }).promise();
                return Body;
            },
            async set(key, value) {
                await options.interface.putObject({
                    Bucket: options.bucket,
                    Key: getKey(key),
                    Body: value
                }).promise();
            },
            async delete(key) {
                await options.interface.deleteObject({
                    Bucket: options.bucket,
                    Key: getKey(key)
                }).promise();
            },
            async has(key) {
                try {
                    await options.interface.headObject({
                        Bucket: options.bucket,
                        Key: getKey(key)
                    }).promise();
                    return true;
                }
                catch (error) {
                    return false;
                }
            },
            async *keys() {
                if (options.keys) {
                    return yield* options.keys();
                }
                if (options.interface.listObjectsV2) {
                    let response = undefined;
                    do {
                        response = await options.interface.listObjectsV2({
                            Bucket: options.bucket,
                            ContinuationToken: response ? response.NextContinuationToken : undefined,
                        }).promise();
                        yield* contents(response);
                    } while (response.NextContinuationToken);
                }
                if (options.interface.listObjects) {
                    let response = undefined;
                    do {
                        response = await options.interface.listObjects({
                            Bucket: options.bucket,
                            Marker: response ? response.NextMarker : undefined,
                        }).promise();
                        yield* contents(response);
                    } while (response.NextMarker);
                }
            }
        },
        is: options.is
    });
    function* contents(response) {
        for (const { Key: key } of response.Contents || []) {
            if (isKey(key)) {
                yield key;
            }
        }
    }
    function isKey(key) {
        if (options.isKey) {
            return options.isKey(key);
        }
        return typeof key === "string";
    }
    function getKey(key) {
        if (typeof key === "string") {
            if (key.startsWith("https://") || key.startsWith("http://") || key.startsWith("s3://")) {
                return getKey(new URL(key));
            }
            return key;
        }
        return key.pathname;
    }
}
export class S3Store extends Store {
    constructor(options) {
        super(s3Store(options));
    }
}
