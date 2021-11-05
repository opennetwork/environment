import {h, createFragment, VNode} from "@virtualstate/fringe";
import {addEventListener} from "../environment/environment";
import {fetch} from "../fetch/fetch";
import {Request} from "@opennetwork/http-representation";
import {v4} from "uuid";
import {getEvent} from "../events/event/dispatcher";
import {FetchEvent} from "../fetch/event";
import {RenderEvent} from "../render/render";
import {addRequestEventHandler} from "./event";

async function Layout({ title, script, class: mainClass, id }: Record<string, unknown>, child: VNode) {
    const response = await fetch("/data", {
        method: "GET"
    });
    const data = await response.text();
    return (
        <>
            <h1>{title ?? "Hello"}</h1>
            <main class={`${id}-main ${mainClass ?? ""}`.trim()}>
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
            {script}
        </>
    )
}

function getId({ searchParams }: URL) {
    return /^[a-z0-9-_+]+$/.test(searchParams.get("id") ?? "") ? searchParams.get("id") : v4();
}

function addRenderEventListener(options: { method?: string | RegExp, pathname?: string | RegExp }, fn: ((event: RenderEvent & { url: URL }) => Promise<void> | void)): void {
    addRequestEventHandler("render", options, fn);
}

addRenderEventListener({ method: "GET", pathname: "/template" }, ({ render, url }) => {
    const id = getId(url);
    return render(
        <template id={`template-${id}`} mount pathname={url.pathname}>
            <Layout
                id={id}
                title={`In Template ${id}!`}
                class={`templated-${id}`}
                script={
                    <script type="module" src="/template-script">
                    </script>
                }
            >
                <p key="zee">Content loaded</p>
                <p attr={false} other={true} value={1} one="two">Content there</p>
            </Layout>
        </template>
    )
})

addRenderEventListener({ method: "GET" }, ({ render, url }) => {
    const id = getId(url);
    return render(
        <html>
        <head>
            <title>My Website</title>
        </head>
        <body>
        <Layout
            id={id}
            script={
                <>
                    <script type="module">
                        {`
window.data = JSON.parse(
    document.querySelector("script#data").textContent
);
    `}
                    </script>
                    <script type="module">
                        {`
function getImports(root) {
    const scripts = Array.from(root.querySelectorAll("script[type=module][src]"));
    return scripts.map(script => script.getAttribute("src"));
}
                    
async function replaceBodyWithTemplate(template) {
    const imports = getImports(template.content);
    // Remove all scripts that were included, modules can be imported dynamically,
    // which will happen after the template replaces the body
    template.content.querySelectorAll("script").forEach(element => element.remove());
    const nextBody = document.createElement("body");
    nextBody.append(document.importNode(template.content, true))
    document.body.replaceWith(nextBody);
    if (template.hasAttribute("mount")) {
      document.head.append(template);
    }
    await Promise.all(imports.map(src => import(src)));
}

async function fetchTemplate(url) {
  const { pathname } = new URL(url, location.origin);
  const existingTemplate = document.querySelector(\`template[pathname="\${pathname}"]\`);
  if (existingTemplate) return replaceBodyWithTemplate(existingTemplate);
  const response = await fetch(url, {
    headers: {
        Accept: "text/html"
    }
  });
  const templateHTML = await response.text();
  const templateRoot = document.createElement("div");
  templateRoot.innerHTML = templateHTML;
  const template = templateRoot.querySelector("template");
  if (template) {
    await replaceBodyWithTemplate(template);
  }
} 

await fetchTemplate("/template?id=${id}");
                                    `}
                    </script>
                    <script type="module" src="/browser-script">
                    </script>
                </>
            }
        />
        </body>
        </html>
    )
});
