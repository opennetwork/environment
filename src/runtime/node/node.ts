import {Environment as EnvironmentTemplate, getEnvironment, runInEnvironment} from "../../environment/environment"
import { start as startFetchService } from "./fetch-service"
import { createFlag, setFlag } from "../../flags/flags"
import {getEnabledFlags} from "./service";

export class Environment extends EnvironmentTemplate {

    constructor(name: string = "node") {
        super(name)
    }

    async runInAsyncScope(fn: () => void | Promise<void>): Promise<void> {
        return runInEnvironment(this, fn);
    }

    async configure() {
        const flags = getEnabledFlags();
        flags.forEach(flag => createFlag(flag))
        flags.forEach(flag => setFlag(flag))
        await import("./tracing");
    }

    async postConfigure() {
        this.addService(startFetchService())
    }

}
