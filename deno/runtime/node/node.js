import { Environment as EnvironmentTemplate, runInEnvironment } from "../../environment/environment.js";
import { start as startFetchService } from "./fetch-service.js";
import { createFlag, setFlag } from "../../flags/flags.js";
import { getEnabledFlags } from "./service.js";
export class Environment extends EnvironmentTemplate {
    constructor(name = "node") {
        super(name);
    }
    async runInAsyncScope(fn) {
        return runInEnvironment(this, fn);
    }
    async configure() {
        const flags = getEnabledFlags();
        flags.forEach(flag => createFlag(flag));
        flags.forEach(flag => setFlag(flag));
        await import("./tracing.js");
    }
    async postConfigure() {
        this.addService(startFetchService());
    }
}
