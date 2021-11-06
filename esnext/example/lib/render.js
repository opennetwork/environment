import { h, toString as toStringCore } from "@virtualstate/fringe";
import { addFetchEventListener } from "./fetch.js";
import AbortController from "abort-controller";
import { defer } from "../../deferred.js";
import { dispatchEvent } from "../../environment/environment.js";
import { Response } from "@opennetwork/http-representation";
import { addRequestEventHandler } from "./request.js";
export function addRenderEventListener(options, fn) {
    addRequestEventHandler("render", options, fn);
}
export function addRenderFetchEventListener(options) {
    addFetchEventListener(options, async ({ respondWith, request, environment }) => {
        const controller = new AbortController();
        const { resolve: render, promise } = defer();
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
        respondWith(new Response(`${string.startsWith("<html") ? "<!DOCTYPE html>\n" : ""}${string}`, {
            status: 200,
            headers: {
                "Content-Type": "text/html"
            }
        }));
    });
}
function isScalar(node) {
    if (!node.scalar)
        return false;
    const tags = ["script", "link", "meta", "br"];
    return !tags.includes(node.source);
}
function getBody(node, body) {
    if (body) {
        return `\n${body.split("\n").map(value => `  ${value}`).join("\n")}\n`;
    }
    if (node.source !== "script") {
        return "";
    }
    return "\n";
}
export function toViewString(node) {
    return toStringCore.call({ isScalar, getBody }, node);
}
