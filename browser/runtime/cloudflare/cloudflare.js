import { Environment as EnvironmentTemplate, setEnvironment } from "../../environment/environment.js";
let instance = undefined;
let instances = 0;
export class Environment extends EnvironmentTemplate {
    constructor(name = "cloudflare") {
        super(name);
        if (!instance) {
            instance = this;
        }
        instances += 1;
    }
    configure() {
        setEnvironment(() => this);
    }
    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this cloudflare process");
        }
        return instance;
    }
}
