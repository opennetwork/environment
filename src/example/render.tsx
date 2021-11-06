import {h, createFragment, VNode} from "@virtualstate/fringe";
import {fetch} from "../fetch/fetch";
import {v4} from "uuid";
import {addRenderEventListener} from "./lib";
import {getStore} from "../storage/store/store";

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

addRenderEventListener({ method: "GET", pathname: "/template" }, async ({ render, url }) => {
    const id = getId(url);
    const store = getStore();
    await store.set(`templated:${id}`, 1);
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

addRenderEventListener({ method: "GET", pathname: "/view" }, ({ render, url }) => {
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
  const existingTemplate = document.querySelector(\`template[mount][pathname="\${pathname}"]\`);
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
