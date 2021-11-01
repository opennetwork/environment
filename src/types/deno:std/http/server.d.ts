declare module "deno:std/http/server" {
    export function listenAndServe(url: string, handler: (request: Request) => Promise<Response>): Promise<void>;
}
