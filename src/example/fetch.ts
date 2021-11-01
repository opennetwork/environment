import { addEventListener } from "../environment/environment";
import { Response, Request } from "@opennetwork/http-representation";
import { dispatchFetchEvent, fetch} from "../fetch/fetch";
import {FetchEvent} from "../fetch/event";

function notFound() {
    return new Response("Not Found", {
        status: 404
    })
}

async function getResponseForGET({ url }: Request): Promise<Response> {
    if (url.startsWith("/ping")) {
        return new Response("Pong", {
            status: 200
        });
    }
    if (url.startsWith("/pong")) {
        return new Response("Ping", {
            status: 200
        });
    }
    if (url.startsWith("/hello")) {
        return new Response("World", {
            status: 200
        });
    }
    return notFound();
}

addEventListener("fetch", async ({ respondWith, request }) => {
    if (request.method === "GET") {
        return respondWith(getResponseForGET(request))
    } else {
        respondWith(notFound());
    }
})

addEventListener("execute", async () => {
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

addEventListener("execute", async () => {
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

addEventListener("execute", async () => {
    const response = await fetch("https://example.com", {
        method: "GET"
    });
    const example = await response.text();
    console.log({ example });
})
