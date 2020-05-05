import {EventCallback, Event} from "../events/events"
import {
    CompleteEvent, CompleteEventType,
    ConfigureEvent,
    ConfigureEventType,
    EnvironmentEventTarget,
    ExecuteEvent,
    ExecuteEventType, FetchEvent, FetchEventType
} from "./events"
import {EnvironmentContext, createEnvironmentContext} from "./context"

export * from "./events"
export * from "./context"

export interface Environment extends EnvironmentEventTarget {
    name: string
    context: EnvironmentContext
    runInAsyncScope(fn: () => void | Promise<void>): Promise<void>
    configure?(): void | Promise<void>
}

export class Environment extends EnvironmentEventTarget implements Environment {

    constructor(public name: string, public context: EnvironmentContext = createEnvironmentContext()) {
        super(context);
    }

    async runInAsyncScope(fn: () => void | Promise<void>): Promise<void> {
        await fn()
    }

}

const defaultEventTarget = new Environment("unknown")

export function addEventListener(type: typeof FetchEventType, callback: EventCallback<FetchEvent, EnvironmentContext>): void
export function addEventListener(type: typeof ExecuteEventType, callback: EventCallback<ExecuteEvent, EnvironmentContext>): void
export function addEventListener(type: typeof ConfigureEventType, callback: EventCallback<ConfigureEvent, EnvironmentContext>): void
export function addEventListener(type: typeof CompleteEventType, callback: EventCallback<CompleteEvent, EnvironmentContext>): void
export function addEventListener(type: string, callback: EventCallback<Event>): void
export function addEventListener(type: string, callback: EventCallback<any>): void {
    defaultEventTarget.addEventListener(type, callback)
}

export function removeEventListener(type: string, callback: EventCallback) {
    defaultEventTarget.removeEventListener(type, callback)
}

export async function dispatchEvent(event: CompleteEvent): Promise<void>
export async function dispatchEvent(event: ConfigureEvent): Promise<void>
export async function dispatchEvent(event: ExecuteEvent): Promise<void>
export async function dispatchEvent(event: Event): Promise<void>
export async function dispatchEvent(event: Event): Promise<void> {
    await defaultEventTarget.dispatchEvent(event)
}

export async function hasEventListener(type: string) {
    return defaultEventTarget.hasEventListener(type)
}

let getEnvironmentFn: (() => Environment | undefined) | undefined
export function getEnvironment() {
    if (getEnvironmentFn) {
        return getEnvironmentFn()
    }
}

export function setEnvironment(fn: () => Environment | undefined) {
    getEnvironmentFn = fn
}
