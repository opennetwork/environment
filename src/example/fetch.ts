import {addEventListener, dispatchEvent} from "../environment/environment";
import { Response, Request } from "@opennetwork/http-representation";
import { dispatchFetchEvent, fetch} from "../fetch/fetch";
import {FetchEvent} from "../fetch/event";
import {defer} from "../deferred";
import {RenderFunction} from "../render/render-function";
import {h, toString, VNode} from "@virtualstate/fringe";

function notFound() {
    return new Response("Not Found", {
        status: 404
    })
}

async function getResponseForGET(request: Request): Promise<Response> {
    const { url } = request;
    const { pathname } = new URL(url, "https://fetch.spec.whatwg.org");
    if (pathname === "/view") {
        const { resolve: render, promise } = defer<RenderFunction | VNode>();
        const eventPromise = dispatchEvent({
            type: "render",
            render
        });
        const node = await promise;
        const view = h(node, { request });
        const string = await toString(view);
        await eventPromise;
        return new Response(string, {
            status: 200,
            headers: {
                "Content-Type": "text/html"
            }
        });
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
    if (pathname === "/data" || pathname === "/browser-data") {
        return new Response(JSON.stringify({
            data: "value!"
        }), { status: 200 });
    }
    if (pathname === "/browser-script") {
        return new Response(`
        const response = await fetch("/browser-data");
        window.data = await response.json();
        `, {
            status: 200,
            headers: {
                "Content-Type": "application/javascript"
            }
        })
    }
    return notFound();
}

addEventListener("fetch", async ({ respondWith, request }) => {
    try {
        if (request.method === "GET") {
            return respondWith(await getResponseForGET(request))
        } else if (request.method === "PUT") {
            const { pathname } = new URL(request.url, 'http://localhost');
            if (pathname === '/data') {
                console.log({ body: await request.json() });
                return respondWith(await getResponseForGET(request));
            }
        } else {
            respondWith(notFound());
        }
    } catch (error) {
        respondWith(new Response(`${error}`, {
            status: 500
        }))
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

addEventListener("execute", async () => {
    const response = await fetch("/view", {
        method: "GET"
    });
    const view = await response.text();
    console.log({ view });
})
