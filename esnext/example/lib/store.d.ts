import { Store } from "../../storage/store/store";
import { RequestEventHandlerOptions } from "./request";
import { Request } from "@opennetwork/http-representation";
export interface StoreFetchEventHandlerOptions<I extends Record<string, unknown> = Record<string, unknown>> extends RequestEventHandlerOptions {
    store?: Store;
    pathname: string;
    getKey?(identifier: string, type: string, options: {
        request: Request;
        url: URL;
    }): string;
    transformInput?(input: I, identifier: string, type: string): Record<string, unknown>;
}
export declare function addStoreFetchEventListener<I extends Record<string, unknown> = Record<string, unknown>>(options: StoreFetchEventHandlerOptions<I>): void;
