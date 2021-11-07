import { Environment as EnvironmentTemplate, setEnvironment } from "../../environment/environment.js";
import { BrowserStore } from "./storage/local.js";
import { setStore } from "../../storage/storage.js";
export const BrowserEnvironmentConfig = Symbol("config");
function isBrowserEnvironmentConfigWindow(value) {
    function isBrowserEnvironmentConfigWindowLike(value) {
        return !!value;
    }
    return (isBrowserEnvironmentConfigWindowLike(value) &&
        !!value[BrowserEnvironmentConfig]);
}
let instance = undefined;
let instances = 0;
export class Environment extends EnvironmentTemplate {
    constructor(name = "browser") {
        super(name);
        if (!instance) {
            instance = this;
        }
        instances += 1;
    }
    async configure() {
        setEnvironment(() => this);
        await import("./fetch-service.js");
        const config = {
            ...isBrowserEnvironmentConfigWindow(window) ? window[BrowserEnvironmentConfig] : {}
        };
        if (!config.storage && config.storage !== false) {
            if (typeof localStorage !== "undefined") {
                config.storage = {
                    storage: localStorage
                };
            }
            else if (typeof sessionStorage !== "undefined") {
                config.storage = {
                    storage: sessionStorage
                };
            }
        }
        await this.configureWithConfig(config);
    }
    async configureWithConfig(config) {
        if (config.storage) {
            await setStore(new BrowserStore(config.storage));
        }
    }
    static getEnvironment() {
        if (instances > 1) {
            console.log("Multiple environments created for this browser process");
        }
        return instance;
    }
}
