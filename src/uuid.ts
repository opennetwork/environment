import { v4 as UUID } from "https://deno.land/std@0.113.0/uuid/mod.ts";

export function v4() {
    return UUID.generate();
}
