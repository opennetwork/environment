import { Environment as EnvironmentTemplate } from "../../environment/environment"

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

    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this deno-deploy process")
        }
        return instance
    }

}
