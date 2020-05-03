import { Environment as EnvironmentTemplate } from "../../environment/environment"

let instance: Environment | undefined = undefined
let instances = 0

export class Environment extends EnvironmentTemplate {

    constructor(name: string = "browser") {
        super(name)
        if (!instance) {
            instance = this
        }
        instances += 1
    }

    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this browser process")
        }
        return instance
    }

}
