import {addEventListener, dispatchEvent, getEnvironment} from "../environment/environment";
import { Response, Request } from "@opennetwork/http-representation";
import { dispatchFetchEvent, fetch} from "../fetch/fetch";
import {FetchEvent} from "../fetch/event";
import {defer} from "../deferred";
import {RenderFunction} from "../render/render-function";
import {h, isVNode} from "@virtualstate/fringe";
import {render} from "@virtualstate/dom";

function notFound() {
    return new Response("Not Found", {
        status: 404
    })
}

async function getDocument(): Promise<Document> {
    const environment = getEnvironment();
    if (typeof window !== "undefined" && typeof window.document !== "undefined") {
        return window.document;
    } else if (environment.name.includes("deno")) {
        const { DOMParser } = await import("deno-dom-wasm");
        return new DOMParser().parseFromString("<head><title></title></head><body />", "text/html");
    } else {
        const { default: JSDOM } = await import("jsdom");
        const dom = new JSDOM.JSDOM();
        return dom.window.document;
    }
}

async function getResponseForGET(request: Request): Promise<Response> {
    const { url } = request;
    const { pathname } = new URL(url, "https://fetch.spec.whatwg.org");
    if (pathname === "/view") {
        const { resolve, promise } = defer<RenderFunction>();
        const eventPromise = dispatchEvent({
            type: "render",
            render: resolve
        });
        const node = await promise;
        const view = h(node, { request });
        const document = await getDocument();
        const root = document.createElement("div");
        root.id = "root";
        document.body.appendChild(root);
        await render(view, root);
        await eventPromise;
        return new Response(root.innerHTML, {
            status: 200,
            headers: {
                "Content-Type": "text/html"
            }
        });
    }
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
    try {
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
