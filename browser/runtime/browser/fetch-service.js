import { addEventListener, dispatchEvent } from "../../environment/environment.js";
import { isRunningServiceWorker } from "./is-running.js";
import { addGlobalEventListener } from "../../environment/global-events.js";
addEventListener("configure", async () => {
    if (!isRunningServiceWorker())
        return;
    if (!addGlobalEventListener)
        return;
    addGlobalEventListener("install", () => {
    });
    addGlobalEventListener("fetch", (event) => {
        assertInternalEvent(event);
        void dispatchEvent(event);
        function assertInternalEvent(event) {
            if (typeof event.type !== "string") {
                throw new Error("Expected type");
            }
        }
    });
});
