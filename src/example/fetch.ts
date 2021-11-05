import {addEventListener, dispatchEvent, getEnvironment} from "../environment/environment";
import { Response, Request } from "@opennetwork/http-representation";
import { dispatchFetchEvent, fetch} from "../fetch/fetch";
import {FetchEvent} from "../fetch/event";
import {defer} from "../deferred";
import {RenderFunction} from "../render/render-function";
import {h, toString, VNode} from "@virtualstate/fringe";
import AbortController from "abort-controller";
import {Environment} from "../environment/environment";
import {addRequestEventHandler, RequestEventHandlerOptions} from "./event";

function notFound() {
    return new Response("Not Found", {
        status: 404
    })
}

function isScalar(node: VNode) {
    if (!node.scalar) return false;
    const tags: unknown[] = ["script", "link", "meta"];
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

function addFetchEventListener(options: RequestEventHandlerOptions, fn: ((event: FetchEvent & { url: URL }) => Promise<void> | void)): void {
    addRequestEventHandler("fetch", options, fn);
}

addFetchEventListener({ method: "PUT", pathname: /^\/(data|browser-data|template-data)$/ }, async ({ request }) => {
    console.log({ body: await request.json() });
});

addFetchEventListener({ method: "GET", pathname: /^\/(view|template)$/ }, async ({ respondWith, request, environment, url: { pathname } }) => {
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
    const string = await toString.call({ isScalar, getBody }, view);
    // Abort after toString is completed to terminate all
    controller.abort();
    await eventPromise;
    respondWith(new Response(
    `${pathname.includes("template") ? "" : "<!DOCTYPE html>\n"}${string}`, {
        status: 200,
        headers: {
            "Content-Type": "text/html"
        }
    }));
});

addFetchEventListener({ method: "GET", pathname: "/ping" }, ({ respondWith }) => respondWith(
    new Response("Pong", {
            status: 200
        }
    )
));

addFetchEventListener({ method: "GET", pathname: "/pong" }, ({ respondWith }) => respondWith(
    new Response("Ping", {
            status: 200
        }
    )
));

addFetchEventListener({ method: "GET", pathname: "/hello" }, ({ respondWith }) => respondWith(
    new Response("World", {
            status: 200
        }
    )
));

addFetchEventListener({ method: /(GET|PUT)/, pathname: /^\/(data|browser-data|template-data)$/ }, ({ respondWith, url: { pathname } }) => {
    respondWith(
        new Response(JSON.stringify({
            data: "value!",
            pathname
        }), { status: 200 })
    )
});

addFetchEventListener({ method: "GET", pathname: "/browser-script" }, ({ respondWith }) => respondWith(
    new Response(`
        const response = await fetch("/browser-data");
        window.initialData = window.data;
        window.data = window.fetchedData = await response.json();
        console.log({
            initialData: window.initialData,
            fetchedData: window.fetchedData,
            data: window.data
        });
        `, {
        status: 200,
        headers: {
            "Content-Type": "application/javascript"
        }
    })
));

addFetchEventListener({ method: "GET", pathname: "/template-script" }, ({ respondWith }) => respondWith(
    new Response(`
        const response = await fetch("/template-data");
        window.initialTemplateData = window.data;
        window.data = window.fetchedTemplateData = await response.json();
        console.log({
            initialData: window.initialData,
            fetchedData: window.fetchedData,
            initialTemplateData: window.initialTemplateData,
            fetchedTemplateData: window.fetchedTemplateData,
            data: window.data
        });
        `, {
        status: 200,
        headers: {
            "Content-Type": "application/javascript"
        }
    })
));

addFetchEventListener({ pathname: /^\/\d{3}$/ }, ({ respondWith, url: { pathname }}) => respondWith(
    new Response("", {
        status: +pathname.substr(1)
    })
))

addFetchEventListener({ pathname: "/uncaught-error-inner" }, ({ respondWith }) => {
    respondWith(Promise.resolve().then(async () => {
        throw new Error("Externally triggered uncaught inner error")
    }));
});

addFetchEventListener({ pathname: "/uncaught-error" }, () => {
    throw new Error("Externally triggered uncaught error")
});

addEventListener("fetch", async ({ respondWith }) => {
    respondWith(notFound());
});

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

addEventListener("execute", async () => {
    const response = await fetch("/template?id=1", {
        method: "GET"
    });
    const template = await response.text();
    console.log({ template });
})

addEventListener("execute", async () => {
    const response = await fetch("/500", {
        method: "GET"
    });
    console.log({ 500: response.status === 500 });
})

addEventListener("execute", async () => {
    const response = await fetch("/uncaught-error", {
        method: "GET"
    });
    console.log({ uncaughtIs500: response.status === 500 });
})

addEventListener("execute", async () => {
    const response = await fetch("/uncaught-error-inner", {
        method: "GET"
    });
    console.log({ uncaughtInnerIs500: response.status === 500 });
})
