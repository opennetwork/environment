import { EventCallback, Event, EventTarget } from "../events/events"
import { EnvironmentEventTarget } from "./events"
import { error as traceError } from "../tracing/tracing"
import { EnvironmentEvents } from "../events/events"
import { AbortController, isAbortController } from "../events/events"

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
        await fn()
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

const defaultEventTarget = new EventTarget()

export function addEventListener<Type extends (keyof EnvironmentEvents & string)>(type: Type, callback: EventCallback<EnvironmentEvents[Type] & Event<Type>>): void
export function addEventListener<E extends Event, This = unknown>(type: E["type"], callback: EventCallback<E, This>): void
export function addEventListener(type: string, callback: EventCallback): void
export function addEventListener(type: string, callback: EventCallback<any>): void {
    defaultEventTarget.addEventListener(type, callback)
}

export function removeEventListener(type: string, callback: Function) {
    defaultEventTarget.removeEventListener(type, callback)
}

export async function dispatchEvent<Type extends (keyof EnvironmentEvents & string)>(event: EnvironmentEvents[Type] & Event<Type>): Promise<void> {
    await defaultEventTarget.dispatchEvent(event)
}

export async function hasEventListener(type: string, callback?: Function) {
    return defaultEventTarget.hasEventListener(type, callback)
}

let getEnvironmentFn: (() => Environment | undefined) | undefined
const topLevelEnvironment = new Environment("top")
export function getEnvironment() {
    return get() || topLevelEnvironment

    function get() {
        if (getEnvironmentFn) {
            return getEnvironmentFn()
        }
    }
}

export function setEnvironment(fn: () => Environment | undefined) {
    getEnvironmentFn = fn
}
