import { getStore } from "../../storage/store/store.js";
import { addFetchEventListener } from "./fetch.js";
import { Response } from "https://cdn.skypack.dev/@opennetwork/http-representation";
export function addStoreFetchEventListener(options) {
    addFetchEventListener({
        ...options,
        pathname: (pathname) => pathname.startsWith(options.pathname)
    }, async ({ request: { method }, request, url: { pathname }, url, respondWith }) => {
        const store = options.store ?? getStore();
        const [type, identifier, unknown] = pathname
            .replace(options.pathname, "")
            .replace(/^\//, "")
            .split("/")
            .filter(Boolean);
        if (unknown) {
            throw new Error("Unexpected path segment");
        }
        const key = options.getKey?.(identifier, type, { request, url }) ?? `${type}:${identifier || "0"}`;
        if (method === "OPTIONS") {
            return respondWithStatus(204);
        }
        if (method === "HEAD") {
            if (!identifier)
                return respondWithStatus(204);
            const exists = await store.get(key);
            return respondWithStatus(exists ? 204 : 404);
        }
        if (method === "GET") {
            if (identifier) {
                const value = await store.get(key);
                if (!(value && typeof value === "object")) {
                    return respondWithStatus(404);
                }
                return respondWithJSON(value);
            }
            else {
                // Not implemented
                return respondWithStatus(500);
            }
        }
        if (method === "DELETE") {
            if (!identifier)
                return respondWithStatus(405);
            await store.delete(key);
            return respondWithStatus(202);
        }
        if (method === "POST") {
            const exists = await store.has(key);
            if (exists)
                return respondWithStatus(409);
            const requestInput = await request.json();
            const input = await options.transformInput?.(requestInput, identifier, type) ?? requestInput;
            await store.set(key, input);
            return respondWithStatus(202);
        }
        if (method === "PUT") {
            if (!identifier)
                return respondWithStatus(405);
            const requestInput = await request.json();
            const input = await options.transformInput?.(requestInput, identifier, type) ?? requestInput;
            await store.set(key, input);
            return respondWithStatus(202);
        }
        respondWithStatus(405);
        function respondWithStatus(status) {
            return respondWith(new Response("", { status }));
        }
        function respondWithJSON(jsonObject, init) {
            respondWith(new Response(JSON.stringify(jsonObject), {
                status: 200,
                ...init,
                headers: {
                    ...init?.headers,
                    'Content-Type': 'application/json'
                }
            }));
        }
    });
}
