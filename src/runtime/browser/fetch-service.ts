import {
    addEventListener, dispatchEvent
} from "../../environment/environment"
import {isRunningServiceWorker} from "./is-running";
import {addGlobalEventListener} from "../../environment/global-events";
import {Event as InternalEvent} from "../../events/event/event";

addEventListener("configure", async () => {
    if (!isRunningServiceWorker()) return;
    if (!addGlobalEventListener) return;
    addGlobalEventListener("install", () => {

    });
    addGlobalEventListener("fetch", (event: Event) => {
        assertInternalEvent(event);
        void dispatchEvent(event);
        function assertInternalEvent(event: { type: unknown }): asserts event is Event & InternalEvent {
            if (typeof event.type !== "string") {
                throw new Error("Expected type");
            }
        }
    })
})
