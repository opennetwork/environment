import {isRunning as isRunningNode} from "../runtime/node/is-running";
import {addEventListener} from "../environment/environment";

addEventListener("configure", async () => {
    if (isRunningNode()) {
        const { configure } = await import("./tracing.node");
        await configure();
    }
});
