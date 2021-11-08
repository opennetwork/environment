import { addStoreFetchEventListener } from "./lib/index.js";
const pathname = "/store";
addStoreFetchEventListener({
    pathname,
    getKey(type, identifier) {
        return new URL(`/${type}/${identifier}`, "https://storage").toString();
    },
    transformInput(input, identifier, type, { url }) {
        return {
            ...input,
            url: url.toString(),
            identifier,
            "@type": type
        };
    }
});
