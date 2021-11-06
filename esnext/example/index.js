import "./error.js";
import "./render.js";
import "./fetch.js";
import "./storage.js";
import "./flags.js";
import "./test.js";
import { addEventListener } from "../environment/environment.js";
import { fetch } from "../fetch/fetch.js";
addEventListener("execute", async () => {
    if (typeof document === "undefined")
        return;
    if ('serviceWorker' in navigator) {
        const entry = document.querySelector("script[type=module][src][data-environment-service]");
        if (entry) {
            const src = entry.getAttribute("src");
            if (src) {
                await navigator.serviceWorker.register(src, {
                    type: "module"
                });
            }
        }
    }
    function getImports(root) {
        const scripts = Array.from(root.querySelectorAll("script[type=module][src]"));
        return scripts
            .map(script => script.getAttribute("src"))
            .filter((value) => !!value);
    }
    async function replaceBodyWithTemplate(template) {
        const imports = getImports(template.content);
        // Remove all scripts that were included, modules can be imported dynamically,
        // which will happen after the template replaces the body
        template.content.querySelectorAll("script").forEach(element => element.remove());
        const nextBody = document.createElement("body");
        nextBody.append(document.importNode(template.content, true));
        document.body.replaceWith(nextBody);
        if (template.hasAttribute("mount")) {
            document.head.append(template);
        }
        await Promise.all(imports.map(src => import(src)));
    }
    async function fetchTemplate(url) {
        const existingTemplate = document.querySelector(`template[mount][pathname="\${pathname}"]`);
        if (existingTemplate instanceof HTMLTemplateElement)
            return replaceBodyWithTemplate(existingTemplate);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "text/html"
            }
        });
        console.log({ response });
        if (!response.ok)
            throw new Error("Template not found");
        const templateHTML = await response.text();
        const templateRoot = document.createElement("div");
        console.log({ templateHTML });
        templateRoot.innerHTML = templateHTML;
        const template = templateRoot.querySelector("template");
        if (template) {
            await replaceBodyWithTemplate(template);
        }
    }
    await fetchTemplate("/template");
});
addEventListener("complete", () => {
    console.log("Everything else executed");
});
const { default: promise } = await import("../runtime/run.js");
await promise;
