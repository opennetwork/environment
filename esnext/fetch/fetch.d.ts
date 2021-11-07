import { Response as AnyResponse, Request } from "@opennetwork/http-representation";
import { Environment } from "../environment/environment";
import { FetchEvent } from "./event";
export declare function fetch(url: string, init?: RequestInit): Promise<AnyResponse | Response>;
export interface FetchEventInit<T extends string> {
    request: Request;
    abortTimeout?: number | boolean;
    signal?: AbortSignal;
    type: T;
    environment?: Environment;
}
export declare function dispatchFetchEvent<T extends string>({ request: httpRequest, abortTimeout, signal: externalSignal, type, environment: externalEnvironment }: FetchEventInit<T>): Promise<[FetchEvent<T>, Promise<AnyResponse>]>;
