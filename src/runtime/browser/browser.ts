import {Environment as EnvironmentTemplate, setEnvironment} from "../../environment/environment"
import {BrowserStorage, BrowserStore, BrowserStoreOptions} from "./storage/local"
import {setStore} from "../../storage/storage"

export const BrowserEnvironmentConfig = Symbol("config")


interface BrowserEnvironmentConfig {
    storage?: BrowserStoreOptions | false
}

interface BrowserEnvironmentConfigWindow {
    [BrowserEnvironmentConfig]: BrowserEnvironmentConfig
}

declare global {
    interface Window extends BrowserEnvironmentConfigWindow {

    }
}

function isBrowserEnvironmentConfigWindow(value: unknown): value is BrowserEnvironmentConfigWindow {
    function isBrowserEnvironmentConfigWindowLike(value: unknown): value is { [BrowserEnvironmentConfig]: unknown } {
        return !!value
    }
    return (
        isBrowserEnvironmentConfigWindowLike(value) &&
        !!value[BrowserEnvironmentConfig]
    )
}


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

    async configure(): Promise<void> {
        setEnvironment(() => this);

        await import("./fetch-service");

        const config = {
            ...isBrowserEnvironmentConfigWindow(window) ? window[BrowserEnvironmentConfig] : {}
        }

        if (!config.storage && config.storage !== false) {
            if (typeof localStorage !== "undefined") {
                config.storage = {
                    storage: localStorage
                }
            } else if (typeof sessionStorage !== "undefined") {
                config.storage = {
                    storage: sessionStorage
                }
            }
        }

        await this.configureWithConfig(config)
    }

    async configureWithConfig(config: BrowserEnvironmentConfig) {
        if (config.storage) {
            await setStore(new BrowserStore(config.storage))
        }
    }

    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this browser process")
        }
        return instance
    }

}
