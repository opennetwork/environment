import {Event} from "../events/event/event";
import {Request, Response} from "@opennetwork/http-representation";

export interface FetchEvent<T extends string = "fetch"> extends Event<T> {
    request: Request
    respondWith(response: Response | Promise<Response>): void
    waitUntil(promise: Promise<unknown>): Promise<void>
}
