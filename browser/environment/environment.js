import { EnvironmentEventTarget } from "./events.js";
import { error as traceError } from "../tracing/tracing.js";
import { isAbortController } from "../events/events.js";
import { createLocalStorage } from "../local-storage.js";
export * from "./events.js";
export * from "./context.js";
export class Environment extends EnvironmentEventTarget {
    name;
    #services = [];
    #closable = [];
    #abortControllers = [];
    #environments = [];
    constructor(name) {
        super();
        this.name = name;
    }
    async runInAsyncScope(fn) {
        await runInEnvironment(this, fn);
    }
    addEnvironment(environment) {
        if (!this.#environments.includes(environment)) {
            this.#environments.push(environment);
            const remove = () => this.#removeEnvironment(environment);
            environment.addEventListener("end", remove);
            this.addEventListener("end", remove);
        }
    }
    #removeEnvironment = (environment) => {
        const index = this.#environments.indexOf(environment);
        if (index > -1) {
            this.#environments.splice(index, 1);
        }
    };
    addService(promise) {
        if (!this.#services.includes(promise)) {
            // Ensure we do not trigger an unhandled promise, we will handle it, it will be reported using a trace
            this.#services.push(promise.catch(error => {
                traceError(error);
            }));
            const remove = () => this.#removeService(promise);
            // Remove once we no longer need to wait for it
            // TODO decide if should be added to catch as well
            promise.then(remove, remove);
        }
    }
    #removeService = (promise) => {
        const index = this.#services.indexOf(promise);
        if (index > -1) {
            this.#services.splice(index, 1);
        }
    };
    addClosable(closable) {
        if (!this.#closable.includes(closable)) {
            this.#closable.push(closable);
        }
    }
    addAbortController(controller) {
        if (!isAbortController(controller)) {
            return;
        }
        if (controller.signal.aborted) {
            return;
        }
        if (!this.#abortControllers.includes(controller)) {
            this.#abortControllers.push(controller);
            controller.signal.addEventListener("abort", this.#removeAbortController.bind(this, controller));
        }
    }
    #removeAbortController = (controller) => {
        const index = this.#abortControllers.indexOf(controller);
        if (index > -1) {
            this.#abortControllers.splice(index, 1);
        }
    };
    async waitForServices() {
        const services = this.#services.slice();
        const environments = this.#environments.slice();
        await Promise.all([
            ...services,
            ...environments.map(environment => environment.waitForServices())
        ]);
    }
    async end() {
        const abortControllers = this.#abortControllers.slice();
        abortControllers.forEach(controller => controller.abort());
        const closable = this.#closable.slice();
        closable.forEach(value => {
            value.close();
            const index = this.#closable.indexOf(value);
            this.#closable.splice(index, 1);
        });
        await this.waitForServices();
    }
}
const localStorage = createLocalStorage();
const topLevelEnvironment = new Environment("top");
const defaultEventTarget = topLevelEnvironment;
export function addEventListener(type, callback) {
    getEnvironment().addEventListener(type, callback);
}
export function removeEventListener(type, callback) {
    defaultEventTarget.removeEventListener(type, callback);
    getEnvironment().removeEventListener(type, callback);
}
export async function dispatchEvent(event) {
    const environment = getEnvironment();
    if (await environment.hasEventListener(event.type)) {
        return environment.dispatchEvent(event);
    }
    else {
        return defaultEventTarget.dispatchEvent(event);
    }
}
export async function hasEventListener(type, callback) {
    const [defaultHas, environmentHas] = await Promise.all([
        defaultEventTarget.hasEventListener(type, callback),
        getEnvironment().hasEventListener(type, callback)
    ]);
    return defaultHas || environmentHas;
}
export function getEnvironment() {
    const fn = localStorage.getStore();
    return fn?.() || topLevelEnvironment;
}
export function setEnvironment(fn) {
    localStorage.enterWith(fn);
}
export async function runInEnvironment(environment, fn) {
    return localStorage.run(() => environment, fn);
}
