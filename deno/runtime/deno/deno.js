import { Environment as EnvironmentTemplate } from "../../environment/environment.js";
import { start as startFetchService } from "./fetch-service.js";
import { createFlag } from "../../flags/config.js";
import { setFlag } from "../../flags/flags.js";
import { getEnabledFlags } from "./service.js";
let instance = undefined;
let instances = 0;
export class Environment extends EnvironmentTemplate {
    constructor(name = "deno") {
        super(name);
        if (!instance) {
            instance = this;
        }
        instances += 1;
    }
    configure() {
        const flags = getEnabledFlags();
        flags.forEach(flag => createFlag(flag));
        flags.forEach(flag => setFlag(flag));
    }
    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this deno process");
        }
        return instance;
    }
    async postConfigure() {
        this.addService(startFetchService());
    }
}
