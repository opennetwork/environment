import { addStoreFetchEventListener } from "./lib";

addStoreFetchEventListener({
    pathname: "/store",
    getKey(type, identifier, { url: { origin } }): string {
        const url = new URL(origin);
        url.pathname = `/${type}/${identifier}`;
        return url.toString();
    },
    transformInput(input, identifier, type) {
        return {
            ...input,
            identifier,
            "@type": type
        }
    }
});
