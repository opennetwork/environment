import {h, toString as toStringCore, VNode} from "@virtualstate/fringe";
import {addFetchEventListener} from "./fetch";
import AbortController from "abort-controller";
import {defer} from "../../deferred";
import {RenderFunction} from "../../render/render-function";
import {dispatchEvent} from "../../environment/environment";
import {Response} from "@opennetwork/http-representation";
import {addRequestEventHandler, RequestEventHandlerOptions} from "./request";
import {RenderEvent} from "../../render/render";

export function addRenderEventListener(options: RequestEventHandlerOptions, fn: ((event: RenderEvent & { url: URL }) => Promise<void> | void)): void {
    addRequestEventHandler("render", options, fn);
}

export function addRenderFetchEventListener(options: RequestEventHandlerOptions) {
    addFetchEventListener(options, async ({ respondWith, request, environment  }) => {
        const controller = new AbortController();
        const { resolve: render, promise } = defer<RenderFunction | VNode>();
        const eventPromise = dispatchEvent({
            type: "render",
            render,
            signal: controller.signal,
            request,
            environment
        }).catch(() => void 0 /* TODO */);
        const node = await promise;
        const view = h(node, { request, signal: controller.signal });
        // for await (const stringIteration of toString.call({ isScalar, getBody }, view)) {
        //     console.log({ stringIteration });
        // }
        const string = await toViewString(view);
        // Abort after toString is completed to terminate all
        controller.abort();
        await eventPromise;
        respondWith(new Response(
        `${string.startsWith("<html") ? "<!DOCTYPE html>\n" : ""}${string}`, {
            status: 200,
            headers: {
                "Content-Type": "text/html"
            }
        }));
    });
}

function isScalar(node: VNode) {
    if (!node.scalar) return false;
    const tags: unknown[] = ["script", "link", "meta", "br"];
    return !tags.includes(node.source);
}

function getBody(node: VNode, body: string) {
    if (body) {
        return `\n${body.split("\n").map(value => `  ${value}`).join("\n")}\n`;
    }
    if (node.source !== "script") {
        return ""
    }
    return "\n";
}

export interface IterablePromise<V> extends AsyncIterable<V> {
    then(resolve: (value: V) => void, reject: (error: unknown) => void): void;
}

export function toViewString(node: VNode): IterablePromise<string> {
    return toStringCore.call({ isScalar, getBody }, node);
}
