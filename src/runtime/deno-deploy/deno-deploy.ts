import {Environment as EnvironmentTemplate, setEnvironment} from "../../environment/environment"
import { start as startFetchService } from "./fetch-service";

let instance: Environment | undefined = undefined
let instances = 0

export class Environment extends EnvironmentTemplate {

    constructor(name: string = "deno-deploy") {
        super(name)
        if (!instance) {
            instance = this
        }
        instances += 1
    }

    configure() {
        setEnvironment(() => this);
    }

    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this deno-deploy process")
        }
        return instance
    }

    async postConfigure() {
        this.addService(startFetchService())
    }

}
