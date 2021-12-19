import {isRunning as isRunningNode} from "../runtime/node/is-running";
import {addEventListener} from "../environment/environment";

addEventListener("install", async () => {
    if (isRunningNode()) {
        const { install } = await import("./tracing.node");
        await install();
    }
});
