import { Environment as EnvironmentTemplate } from "../../environment/environment"
import { start as startFetchService } from "./fetch-service"
import { createLocalStorage } from "../../local-storage"

const localStorage = createLocalStorage<Environment>()

export class Environment extends EnvironmentTemplate {

    constructor(name: string = "node") {
        super(name)
    }

    async runInAsyncScope(fn: () => void | Promise<void>) {
        return localStorage.run(this, fn)
    }

    static getEnvironment(): Environment | undefined {
        return localStorage.getStore()
    }

    async postConfigure() {
        this.addService(startFetchService())
    }



}
