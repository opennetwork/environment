import { Environment as EnvironmentTemplate } from "../node/node"

export class Environment extends EnvironmentTemplate {

    constructor() {
        super("node/aws-lambda")
    }

    async configure() {
        await super.configure();
    }

}
