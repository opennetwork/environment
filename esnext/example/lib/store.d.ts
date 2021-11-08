import { Store } from "../../storage/store/store";
import { RequestEventHandlerOptions } from "./request";
import { Request } from "@opennetwork/http-representation";
export interface StoreFetchEventHandlerOptions<I extends Record<string, unknown> = Record<string, unknown>> extends RequestEventHandlerOptions {
    pathname: string;
    getStore?(identifier: string, type: string, options: {
        request: Request;
        url: URL;
    }): Store | Promise<Store>;
    getKey?(identifier: string, type: string, options: {
        request: Request;
        url: URL;
    }): string;
    transformInput?(input: I, identifier: string, type: string, options: {
        request: Request;
        url: URL;
    }): Record<string, unknown>;
}
export declare function addStoreFetchEventListener<I extends Record<string, unknown> = Record<string, unknown>>(options: StoreFetchEventHandlerOptions<I>): void;
