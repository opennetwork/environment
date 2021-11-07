import { h, createFragment } from "https://cdn.skypack.dev/@virtualstate/fringe";
import { fetch } from "../fetch/fetch.js";
import { v4 } from "../uuid.js";
import { addRenderEventListener } from "./lib/index.js";
import { getStore } from "../storage/store/store.js";
async function Layout({ title, script, class: mainClass, id }, child) {
    const response = await fetch("/data", {
        method: "GET"
    });
    const data = await response.text();
    return (h(createFragment, null,
        h("h1", null, title ?? "Hello"),
        h("main", { class: `${id}-main ${mainClass ?? ""}`.trim() }, child ?? (h(createFragment, null,
            h("p", null, "Content loading")))),
        h("footer", null,
            h("a", { href: "https://example.com", target: "_blank" }, "example.com")),
        h("script", { type: "application/json", id: "data" }, data),
        script));
}
function getId({ searchParams }) {
    return /^[a-z0-9-_+]+$/.test(searchParams.get("id") ?? "") ? searchParams.get("id") : v4();
}
addRenderEventListener({ method: "GET", pathname: "/template" }, async ({ render, url }) => {
    const id = getId(url);
    const store = getStore();
    await store.set(`templated:${id}`, 1);
    return render(h("template", { id: `template-${id}`, mount: true, pathname: url.pathname },
        h(Layout, { id: id, title: `In Template ${id}!`, class: `templated-${id}`, script: h("script", { type: "module", src: "/template-script" }) },
            h("p", { key: "zee" }, "Content loaded"),
            h("p", { attr: false, other: true, value: 1, one: "two" }, "Content there"))));
});
addRenderEventListener({ method: "GET", pathname: "/view" }, ({ render, url }) => {
    const id = getId(url);
    return render(h("html", null,
        h("head", null,
            h("title", null, "My Website")),
        h("body", null,
            h(Layout, { id: id, script: h(createFragment, null,
                    h("script", { type: "module" }, `
window.data = JSON.parse(
    document.querySelector("script#data").textContent
);
    `),
                    h("script", { type: "module" }, `
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
                                    `),
                    h("script", { type: "module", src: "/browser-script" })) }))));
});
