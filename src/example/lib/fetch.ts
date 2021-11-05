import {addRequestEventHandler, RequestEventHandlerOptions} from "../event";
import {FetchEvent} from "../../fetch/event";

export function addFetchEventListener(options: RequestEventHandlerOptions, fn: ((event: FetchEvent & { url: URL }) => Promise<void> | void)): void {
    addRequestEventHandler("fetch", options, fn);
}
