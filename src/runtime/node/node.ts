import { Environment as EnvironmentTemplate } from "../../environment/environment"
import { AsyncLocalStorage } from "async_hooks"

const localStorage = new AsyncLocalStorage<Environment>()

export class Environment extends EnvironmentTemplate {

    constructor(name: string = "node") {
        super(name);
        localStorage.enterWith(this)
    }

    async runInAsyncScope(fn: () => void | Promise<void>) {
        return new Promise<void>(
        (resolve, reject) => localStorage.run(
            this,
            () => Promise.resolve()
                    .then(() => fn())
                    .then(resolve)
                    .catch(reject)
            )
        )
    }

    static getEnvironment(): Environment | undefined {
        return localStorage.getStore()
    }

}
