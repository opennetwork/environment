import { addEventListener, dispatchEvent } from "../environment/environment";
import { Response } from "@opennetwork/http-representation";
import { fetch } from "../fetch/fetch";
import { addFetchEventListener, addRenderFetchEventListener } from "./lib";
import { FetchEvent } from "../fetch/event";

function notFound() {
    return new Response("Not Found", {
        status: 404
    })
}

addFetchEventListener({ method: "PUT", pathname: /^\/(data|browser-data|template-data)$/ }, async ({ request }) => {
    await request.json(); // Consume the body, anything that tries to consume this again will receive an error
});

addRenderFetchEventListener({ method: "GET", pathname: /^\/(view|template)$/ });

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
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        })
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

addFetchEventListener({ pathname: "/internal-test" }, async ({ respondWith, request, url, environment }) => {
   try {
       await dispatchEvent({
           type: "test",
           request,
           url,
           environment
       });
       respondWith(new Response("OK", { status: 200 }));
   } catch (error) {
       console.error({ internalTestsError: error });
       respondWith(new Response("NOT OK", { status: 500 }));
   }
})

addEventListener("external-fetch", async ({ request, respondWith }: FetchEvent<"external-fetch">) => {
    if (request.url === "https://example.com/") {
        return respondWith(new Response("Example.com contents!", {
            status: 200
        }));
    }
    return respondWith(new Response("Not Found", {
        status: 404
    }));
})

addEventListener("fetch", async ({ respondWith }) => {
    respondWith(notFound());
});

