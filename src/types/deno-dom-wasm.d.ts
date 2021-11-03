declare module "deno-dom-wasm" {
    export class DOMParser {
        parseFromString(string: string, type: string): Document;
    }
}
