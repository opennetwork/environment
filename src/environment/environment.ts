import {EventCallback, Event, EventTargetAddListenerOptions} from "../events/events"
import { EnvironmentEventTarget } from "./events"
import { error as traceError } from "../tracing/tracing"
import { EnvironmentEvents } from "../events/events"
import { AbortController, isAbortController } from "../events/events"
import { createLocalStorage } from "../local-storage";

export * from "./events"
export * from "./context"

export interface EnvironmentClosable {
    close(): void
}

export interface AbortControllerLike {
    signal: unknown
    abort: unknown
}

export interface Environment extends EnvironmentEventTarget {
    readonly name: string
    runInAsyncScope(fn: () => void | Promise<void>): Promise<void>
    configure?(): void | Promise<void>
    postConfigure?(): void | Promise<void>
    addEnvironment(environment: Environment): void
    addService(promise: Promise<unknown>): void
    addClosable(closable: EnvironmentClosable): void
    addAbortController(controller: AbortControllerLike): void
    waitForServices(): Promise<void>
    end(): Promise<void>
}

export class Environment extends EnvironmentEventTarget implements Environment {

    #services: Promise<unknown>[] = []
    #closable: EnvironmentClosable[] = []
    #abortControllers: AbortController[] = []
    #environments: Environment[] = []

    constructor(public readonly name: string) {
        super()
    }

    async runInAsyncScope(fn: () => void | Promise<void>): Promise<void> {
        await runInEnvironment(this, fn);
    }

    addEnvironment(environment: Environment): void {
        if (!this.#environments.includes(environment)) {
            this.#environments.push(environment)
            const remove = () => this.#removeEnvironment(environment)
            environment.addEventListener("end", remove)
            this.addEventListener("end", remove)
        }
    }

    #removeEnvironment = (environment: Environment): void => {
        const index = this.#environments.indexOf(environment)
        if (index > -1) {
            this.#environments.splice(index, 1)
        }
    }

    addService(promise: Promise<unknown>): void {
        if (!this.#services.includes(promise)) {
            // Ensure we do not trigger an unhandled promise, we will handle it, it will be reported using a trace
            this.#services.push(promise.catch(error => {
               traceError(error)
            }))
            const remove = () => this.#removeService(promise)
            // Remove once we no longer need to wait for it
            // TODO decide if should be added to catch as well
            promise.then(remove, remove)
        }
    }

    #removeService = (promise: Promise<unknown>): void => {
        const index = this.#services.indexOf(promise)
        if (index > -1) {
            this.#services.splice(index, 1)
        }
    }

    addClosable(closable: EnvironmentClosable): void {
        if (!this.#closable.includes(closable)) {
            this.#closable.push(closable)
        }
    }

    addAbortController(controller: AbortControllerLike): void {
        if (!isAbortController(controller)) {
            return
        }
        if (controller.signal.aborted) {
            return
        }
        if (!this.#abortControllers.includes(controller)) {
            this.#abortControllers.push(controller)
            controller.signal.addEventListener("abort", this.#removeAbortController.bind(this, controller))
        }
    }

    #removeAbortController = (controller: AbortController) => {
        const index = this.#abortControllers.indexOf(controller)
        if (index > -1) {
            this.#abortControllers.splice(index, 1)
        }
    }

    async waitForServices(): Promise<void> {
        const services = this.#services.slice()
        const environments = this.#environments.slice()
        await Promise.all([
            ...services,
            ...environments.map(environment => environment.waitForServices())
        ])
    }

    async end(): Promise<void> {
        const abortControllers = this.#abortControllers.slice()
        abortControllers.forEach(controller => controller.abort())

        const closable = this.#closable.slice()
        closable.forEach(value => {
            value.close()
            const index = this.#closable.indexOf(value)
            this.#closable.splice(index, 1)
        })

        await this.waitForServices()
    }

}

const localStorage = createLocalStorage<() => Environment | undefined>();

const topLevelEnvironment = new Environment("top")
const defaultEventTarget = topLevelEnvironment;

export function addEventListener<Type extends (keyof EnvironmentEvents & string)>(type: Type, callback: EventCallback<EnvironmentEvents[Type] & Event<Type>>, options?: EventTargetAddListenerOptions): void
export function addEventListener<E extends Event, This = unknown>(type: E["type"], callback: EventCallback<E, This>, options?: EventTargetAddListenerOptions): void
export function addEventListener(type: string, callback: EventCallback, options?: EventTargetAddListenerOptions): void
export function addEventListener(type: string, callback: EventCallback, options?: EventTargetAddListenerOptions): void {
    (getOptionalEnvironment() ?? defaultEventTarget).addEventListener(type, callback, options);
}

export function removeEventListener(type: string, callback: Function, options?: unknown) {
    defaultEventTarget.removeEventListener(type, callback, options);
    getOptionalEnvironment()?.removeEventListener(type, callback, options);
}

export async function dispatchEvent<Type extends (keyof EnvironmentEvents & string)>(event: EnvironmentEvents[Type] & Event<Type>): Promise<void> {
    const environment = getOptionalEnvironment();
    if (environment && await environment.hasEventListener(event.type)) {
        await environment.dispatchEvent(event);
    }
    // environment should be on the event, allowing the environment context to be populated
    await defaultEventTarget.dispatchEvent(event);
}

export async function hasEventListener(type: string, callback?: Function) {
    const [defaultHas, environmentHas] = await Promise.all([
        defaultEventTarget.hasEventListener(type, callback),
        getOptionalEnvironment()?.hasEventListener(type, callback)
    ])
    return defaultHas || environmentHas;
}

export function getOptionalEnvironment() {
    const fn = localStorage.getStore();
    return fn?.();
}

export function getEnvironment() {
    const environment = getOptionalEnvironment();
    return environment ?? topLevelEnvironment;
}

export function setEnvironment(fn: () => Environment | undefined) {
    localStorage.enterWith(fn);
}

export async function runInEnvironment<T>(environment: Environment, fn: () => Promise<T> | T): Promise<T> {
    return localStorage.run(() => environment, fn);
}
