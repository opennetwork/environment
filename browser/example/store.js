import { addStoreFetchEventListener } from "./lib/index.js";
addStoreFetchEventListener({
    pathname: "/store",
    getKey(type, identifier, { url: { origin } }) {
        const url = new URL(origin);
        url.pathname = `/${type}/${identifier}`;
        return url.toString();
    },
    transformInput(input, identifier, type) {
        return {
            ...input,
            identifier,
            "@type": type
        };
    }
});
