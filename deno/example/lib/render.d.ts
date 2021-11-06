import { VNode } from "@virtualstate/fringe";
import { RequestEventHandlerOptions } from "./request";
import { RenderEvent } from "../../render/render";
export declare function addRenderEventListener(options: RequestEventHandlerOptions, fn: ((event: RenderEvent & {
    url: URL;
}) => Promise<void> | void)): void;
export declare function addRenderFetchEventListener(options: RequestEventHandlerOptions): void;
export interface IterablePromise<V> extends AsyncIterable<V> {
    then(resolve: (value: V) => void, reject: (error: unknown) => void): void;
}
export declare function toViewString(node: VNode): IterablePromise<string>;
