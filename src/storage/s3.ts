import {Store} from "./store/store"
import {JSONStore, ValueIsFn} from "./json"

export type S3StoreKey = string | URL

export interface S3FnReturn<Value> {
    promise(): Promise<Value>
}

export interface S3InterfaceListObjectsContents {
    Contents?: {
        Key: string
    }[]
}
export interface S3InterfaceListObjectsPrefixes {
    CommonPrefixes?: {
        Prefix: string
    }[]
}

export interface S3InterfaceListObjectsV2Response extends S3InterfaceListObjectsContents, S3InterfaceListObjectsPrefixes {
    NextContinuationToken?: string
}

export interface S3InterfaceListObjectsResponse extends S3InterfaceListObjectsContents, S3InterfaceListObjectsPrefixes {
    NextMarker?: string
}

export interface S3Interface {
    getObject(params: { Bucket: string, Key: string }): S3FnReturn<{
        Body?: string
    }>

    putObject(params: { Bucket: string, Key: string, Body: string }): S3FnReturn<{}>

    deleteObject(params: { Bucket: string, Key: string }): S3FnReturn<{}>
    headObject(params: { Bucket: string, Key: string }): S3FnReturn<{}>

    listObjects?(params: { Bucket: string, Marker?: string, Delimiter?: string }): S3FnReturn<S3InterfaceListObjectsResponse>
    listObjectsV2?(params: { Bucket: string, ContinuationToken?: string, Delimiter?: string }): S3FnReturn<S3InterfaceListObjectsV2Response>
}

export interface S3StoreOptions<Key extends S3StoreKey = S3StoreKey, Value = unknown> {
    interface: S3Interface
    bucket: string
    keys?(): AsyncIterable<Key>
    is?: ValueIsFn<Value>
    isKey?: ValueIsFn<Key>
}

function s3Store<Key extends S3StoreKey = S3StoreKey, Value = unknown>(options: S3StoreOptions<Key, Value>) {
    return new JSONStore<Key, Value>({
        base: {
            async get(key: Key) {
                const { Body } = await options.interface.getObject({
                    Bucket: options.bucket,
                    Key: getKey(key)
                }).promise()
                return Body
            },
            async set(key: Key, value: string) {
                await options.interface.putObject({
                    Bucket: options.bucket,
                    Key: getKey(key),
                    Body: value
                }).promise()
            },
            async delete(key: Key) {
                await options.interface.deleteObject({
                    Bucket: options.bucket,
                    Key: getKey(key)
                }).promise()
            },
            async has(key: Key): Promise<boolean> {
                try {
                    await options.interface.headObject({
                        Bucket: options.bucket,
                        Key: getKey(key)
                    }).promise()
                    return true
                } catch (error) {
                    return false
                }
            },
            async *keys(): AsyncIterable<Key> {
                if (options.keys) {
                    return yield* options.keys()
                }
                if (options.interface.listObjectsV2) {
                    let response: S3InterfaceListObjectsV2Response | undefined = undefined
                    do {
                        response = await options.interface.listObjectsV2({
                            Bucket: options.bucket,
                            ContinuationToken: response ? response.NextContinuationToken : undefined,
                        }).promise()
                        yield* contents(response)
                    } while (response.NextContinuationToken)
                }
                if (options.interface.listObjects) {
                    let response: S3InterfaceListObjectsResponse | undefined = undefined
                    do {
                        response = await options.interface.listObjects({
                            Bucket: options.bucket,
                            Marker: response ? response.NextMarker : undefined,
                        }).promise()
                        yield* contents(response)
                    } while (response.NextMarker)
                }
            }
        },
        is: options.is
    })

    function *contents(response: S3InterfaceListObjectsContents) {
        for (const { Key: key } of response.Contents || []) {
            if (isKey(key)) {
                yield key
            }
        }
    }

    function isKey(key: unknown): key is Key {
        if (options.isKey) {
            return options.isKey(key)
        }
        return typeof key === "string"
    }

    function getKey(key: S3StoreKey): string {
        if (typeof key === "string") {
            if (key.startsWith("https://") || key.startsWith("http://") || key.startsWith("s3://")) {
                return getKey(new URL(key))
            }
            return key
        }
        return key.pathname
    }
}

export class S3Store<Key extends S3StoreKey = S3StoreKey, Value = unknown> extends Store<Key, Value> {

    constructor(options: S3StoreOptions<Key, Value>) {
        super(s3Store(options))
    }

}
