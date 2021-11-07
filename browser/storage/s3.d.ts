import { Store } from "./store/store";
import { ValueIsFn } from "./json";
export declare type S3StoreKey = string | URL;
export interface S3FnReturn<Value> {
    promise(): Promise<Value>;
}
export interface S3InterfaceListObjectsContents {
    Contents?: {
        Key: string;
    }[];
}
export interface S3InterfaceListObjectsPrefixes {
    CommonPrefixes?: {
        Prefix: string;
    }[];
}
export interface S3InterfaceListObjectsV2Response extends S3InterfaceListObjectsContents, S3InterfaceListObjectsPrefixes {
    NextContinuationToken?: string;
}
export interface S3InterfaceListObjectsResponse extends S3InterfaceListObjectsContents, S3InterfaceListObjectsPrefixes {
    NextMarker?: string;
}
export interface S3Interface {
    getObject(params: {
        Bucket: string;
        Key: string;
    }): S3FnReturn<{
        Body?: string;
    }>;
    putObject(params: {
        Bucket: string;
        Key: string;
        Body: string;
    }): S3FnReturn<{}>;
    deleteObject(params: {
        Bucket: string;
        Key: string;
    }): S3FnReturn<{}>;
    headObject(params: {
        Bucket: string;
        Key: string;
    }): S3FnReturn<{}>;
    listObjects?(params: {
        Bucket: string;
        Marker?: string;
        Delimiter?: string;
    }): S3FnReturn<S3InterfaceListObjectsResponse>;
    listObjectsV2?(params: {
        Bucket: string;
        ContinuationToken?: string;
        Delimiter?: string;
    }): S3FnReturn<S3InterfaceListObjectsV2Response>;
}
export interface S3StoreOptions<Key extends S3StoreKey = S3StoreKey, Value = unknown> {
    interface: S3Interface;
    bucket: string;
    keys?(): AsyncIterable<Key>;
    is?: ValueIsFn<Value>;
    isKey?: ValueIsFn<Key>;
}
export declare class S3Store<Key extends S3StoreKey = S3StoreKey, Value = unknown> extends Store<Key, Value> {
    constructor(options: S3StoreOptions<Key, Value>);
}
