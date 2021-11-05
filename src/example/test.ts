import {addEventListener} from "../environment/environment";
import {dispatchFetchEvent, fetch} from "../fetch/fetch";
import {Request, Response} from "@opennetwork/http-representation";
import {FetchEvent} from "../fetch/event";

addEventListener("test", async () => {
    console.log("Execute");
    const [, promise] = await dispatchFetchEvent({
        request: new Request("/ping", {
            method: "GET"
        }),
        type: "fetch"
    });
    const response = await promise;
    const ping = await response.text();
    console.log({ ping });
})

addEventListener("test", async () => {
    const response = await fetch("/pong", {
        method: "GET"
    });
    const pong = await response.text();
    console.log({ pong });
})

// A maybe idea
addEventListener("external-fetch", async ({ request, respondWith }: FetchEvent<"external-fetch">) => {
    if (request.url === "https://example.com") {
        return respondWith(new Response("Example.com contents!", {
            status: 200
        }));
    }
    return respondWith(new Response("Not Found", {
        status: 404
    }));
})

addEventListener("test", async () => {
    const response = await fetch("https://example.com", {
        method: "GET"
    });
    const example = await response.text();
    console.log({ example });
})

addEventListener("test", async () => {
    const response = await fetch("/data", {
        method: "GET"
    });
    const { data } = await response.json();
    console.log({ data });
})

addEventListener("test", async () => {
    const response = await fetch("/data", {
        method: "PUT",
        body: JSON.stringify({
            data: "input!"
        })
    });
    const { data } = await response.json();
    console.log({ data });
})

addEventListener("test", async () => {
    const response = await fetch("/view", {
        method: "GET"
    });
    const view = await response.text();
    console.log({ view });
})

addEventListener("test", async () => {
    const response = await fetch("/template?id=1", {
        method: "GET"
    });
    const template = await response.text();
    console.log({ template });
})

addEventListener("test", async () => {
    const response = await fetch("/500", {
        method: "GET"
    });
    console.log({ 500: response.status === 500 });
})

addEventListener("test", async () => {
    const response = await fetch("/uncaught-error", {
        method: "GET"
    });
    console.log({ uncaughtIs500: response.status === 500 });
})

addEventListener("test", async () => {
    const response = await fetch("/uncaught-error-inner", {
        method: "GET"
    });
    console.log({ uncaughtInnerIs500: response.status === 500 });
})
