import {FetchEvent} from "../../fetch/event";
import {addRequestEventHandler, RequestEventHandlerOptions} from "./request";

export function addFetchEventListener(options: RequestEventHandlerOptions, fn: ((event: FetchEvent & { url: URL }) => Promise<void> | void)): void {
    addRequestEventHandler("fetch", options, fn);
}
