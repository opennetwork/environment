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
    const { pathname } = new URL(url, "https://fetch.spec.whatwg.org");
    console.log({ pathname });
    if (pathname === "/data") {
        return new Response(JSON.stringify({
            data: "value!"
        }), { status: 200 });
    }
    if (pathname === "/ping") {
        return new Response("Pong", {
            status: 200
        });
    }
    if (pathname === "/pong") {
        return new Response("Ping", {
            status: 200
        });
    }
    if (pathname === "/hello") {
        return new Response("World", {
            status: 200
        });
    }
    return notFound();
}

addEventListener("fetch", async ({ respondWith, request }) => {
    if (request.method === "GET") {
        return respondWith(getResponseForGET(request))
    } else if (request.method === "PUT") {
        const { pathname } = new URL(request.url, 'http://localhost');
        if (pathname === '/data') {
            console.log({ requestBody: await request.json() });
            return respondWith(getResponseForGET(request));
        }
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

addEventListener("execute", async () => {
    const response = await fetch("/data", {
        method: "GET"
    });
    const { data } = await response.json();
    console.log({ data });
})

addEventListener("execute", async () => {
    const response = await fetch("/data", {
        method: "PUT",
        body: JSON.stringify({
            data: "input!"
        })
    });
    const { data } = await response.json();
    console.log({ data });
})
