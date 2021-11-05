import {Environment as EnvironmentTemplate, setEnvironment} from "../../environment/environment"
import { start as startFetchService } from "./fetch-service";
import {createFlag} from "../../flags/config";
import {setFlag} from "../../flags/flags";
import {getEnabledFlags} from "./service";

let instance: Environment | undefined = undefined
let instances = 0

export class Environment extends EnvironmentTemplate {

    constructor(name: string = "deno") {
        super(name)
        if (!instance) {
            instance = this
        }
        instances += 1
    }

    configure() {
        const flags = getEnabledFlags();
        flags.forEach(flag => createFlag(flag))
        flags.forEach(flag => setFlag(flag))
    }

    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this deno process")
        }
        return instance
    }

    async postConfigure() {
        this.addService(startFetchService())
    }

}
