import { Environment as EnvironmentTemplate } from "../../environment/environment"
import { start as startFetchService } from "./fetch-service"
import { createLocalStorage } from "../../local-storage"
import { createFlag, setFlag } from "../../flags/flags"

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

    configure(): void {
        const flags = Object.keys(process.env).filter(key => process.env[key] === "true")
        flags.forEach(flag => createFlag(flag))
        flags.forEach(flag => setFlag(flag))
    }

    async postConfigure() {
        this.addService(startFetchService())
    }



}
