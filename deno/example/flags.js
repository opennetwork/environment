import { addEventListener, dispatchEvent, getEnvironmentContext } from "../environment/environment.js";
import { createFlag, resetFlag } from "../flags/config.js";
import { hasFlag, removeFlag, setFlag } from "../flags/flags.js";
addEventListener("configure", async function configure(event) {
    createFlag("FLAG");
    console.log({
        FLAG_create: hasFlag("FLAG")
    });
    setFlag("FLAG");
    console.log({
        FLAG_set: hasFlag("FLAG")
    });
    addEventListener("child event", () => {
        console.log({
            // flags are available in children events
            FLAG_child: hasFlag("FLAG")
        });
    });
    await dispatchEvent({ type: "child event" });
    resetFlag("FLAG");
    console.log({
        // Resetting a flag hides it from the environment, whether it is set or removed
        FLAG_reset: hasFlag("FLAG")
    });
    createFlag("FLAG");
    console.log({
        // Resetting + Creating does not remove flag states
        FLAG_created: hasFlag("FLAG")
    });
    removeFlag("FLAG");
    console.log({
        // Removing a flag specifically is turning it off
        FLAG_removed: hasFlag("FLAG")
    });
    setFlag("FLAG");
    console.log({
        FLAG_set: hasFlag("FLAG")
    });
    const context = getEnvironmentContext();
    if (context) {
        context["identity"] = {
            _id: "1"
        };
    }
});
addEventListener("execute", async function handler() {
    console.log({
        FLAG: hasFlag("FLAG")
    });
});
