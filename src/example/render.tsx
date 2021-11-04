import {h, createFragment, VNode} from "@virtualstate/fringe";
import {addEventListener} from "../environment/environment";
import {fetch} from "../fetch/fetch";
import {Request} from "@opennetwork/http-representation";
import {v4} from "uuid";

function isRequest(request: unknown): request is Request {
    function isRequestLike(request: unknown): request is { json: unknown, url: unknown } {
        return !!request;
    }
    return (
        isRequestLike(request) &&
        typeof request.url === "string" &&
        typeof request.json === "function"
    );
}

function assertRequest(request: unknown): asserts request is Request {
    if (!isRequest(request)) {
        throw new Error("Expected request");
    }
}

addEventListener("render", async ({ render, signal, request }) => {
    signal.addEventListener("abort", () => void 0);

    assertRequest(request);

    const response = await fetch("/data", {
        method: "GET"
    });

    const data = await response.text();

    const { pathname, searchParams } = new URL(request.url, "https://fetch.spec.whatwg.org");
    const id = /^[a-z0-9-_+]+$/.test(searchParams.get("id") ?? "") ? searchParams.get("id") : v4();

    function Layout({ title, script, class: mainClass }: Record<string, unknown>, child: VNode) {
        return (
            <>
                <h1>{title ?? "Hello"}</h1>
                <main class={`${id}-main ${mainClass}`}>
                    {child ?? (
                        <>
                            <p>Content loading</p>
                        </>
                    )}
                </main>
                <footer>
                    <a href="https://example.com" target="_blank">example.com</a>
                </footer>
                <script type="application/json" id="data">{data}</script>
                <script type="module">
                    {`
window.data = JSON.parse(
    document.querySelector("script#data").textContent
);
${script ?? ""}
`}
                </script>
                <script type="module" src="/browser-script">
                </script>
            </>
        )
    }

    if (pathname === "/template") {
        return await render(
            <template id={`template-${id}`}>
                <Layout
                    title={`In Template ${id}!`}
                    class={`templated-${id}`}
                >
                    <p key="zee">Content loaded</p>
                    <p attr={false} other={true} value={1} one="two">Content there</p>
                    <script type="module" src="/template-script">
                    </script>
                </Layout>
            </template>
        )
    }

    await render(
        <html>
            <head>
                <title>My Website</title>
            </head>
            <body>
                <Layout
                    script={
                        `
const response = await fetch("/template?id=${id}");
const templateHTML = await response.text();
const templateRoot = document.createElement("div");
templateRoot.innerHTML = templateHTML;
const template = templateRoot.querySelector("template");
if (template) {
    const imports = getImports(template.content);
    const existing = getImports(document);
    const remaining = imports.filter(src => !existing.includes(src));
    template.content.querySelectorAll("script").forEach(element => element.remove());
    document.body.replaceWith(...Array.from(template.content.children));
    await Promise.all(imports.map(src => import(src)));
}

function getImports(root) {
    const scripts = Array.from(root.querySelectorAll("script[type=module][src]"));
    return scripts.map(script => script.getAttribute("src"));
}
                   `}
                />
            </body>
        </html>
    );
});
