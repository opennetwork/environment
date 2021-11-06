import { FetchEvent } from "../../fetch/event";
import { RequestEventHandlerOptions } from "./request";
export declare function addFetchEventListener(options: RequestEventHandlerOptions, fn: ((event: FetchEvent & {
    url: URL;
}) => Promise<void> | void)): void;
