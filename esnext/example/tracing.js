import { isRunning as isRunningNode } from "../runtime/node/is-running.js";
import { addEventListener } from "../environment/environment.js";
addEventListener("configure", async () => {
    if (isRunningNode()) {
        const { configure } = await import("./tracing.node.js");
        await configure();
    }
});
