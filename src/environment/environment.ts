import {EventCallback, EventTarget, Event} from "../events/events"
import {ConfigureEvent, ConfigureEventType, EnvironmentEventTarget, ExecuteEvent, ExecuteEventType} from "./events"
import {EnvironmentContext, createContext} from "./context"

export * from "./events"

export interface Environment extends EnvironmentEventTarget {
    name: string
    context: EnvironmentContext
    runInAsyncScope(fn: () => void | Promise<void>): Promise<void>
}

export class Environment extends EnvironmentEventTarget implements Environment {

    constructor(public name: string, public context: EnvironmentContext = createContext()) {
        super(context);
    }

    async runInAsyncScope(fn: () => void | Promise<void>): Promise<void> {
        await fn()
    }

}

const defaultEventTarget = new Environment("unknown")
let definedEventTarget: EventTarget | undefined = undefined

export function addEventListener(type: typeof ExecuteEventType, callback: EventCallback<ExecuteEvent, EnvironmentContext>): void
export function addEventListener(type: typeof ConfigureEventType, callback: EventCallback<ConfigureEvent, EnvironmentContext>): void
export function addEventListener(type: string, callback: EventCallback<Event>): void
export function addEventListener(type: string, callback: EventCallback<any>): void {
    defaultEventTarget.addEventListener(type, callback)
    if (definedEventTarget) {
        defaultEventTarget.addEventListener(type, callback)
    }
}

export function removeEventListener(type: string, callback: EventCallback) {
    defaultEventTarget.removeEventListener(type, callback)
    if (definedEventTarget) {
        definedEventTarget.addEventListener(type, callback)
    }
}

export async function dispatchEvent(event: ConfigureEvent): Promise<void>
export async function dispatchEvent(event: ExecuteEvent): Promise<void>
export async function dispatchEvent(event: Event): Promise<void>
export async function dispatchEvent(event: Event): Promise<void> {
    await defaultEventTarget.dispatchEvent(event)
    if (definedEventTarget) {
        await definedEventTarget.dispatchEvent(event)
    }
}

export async function hasEventListener(type: string) {
    const [hasDefault, hasDefined] = await Promise.all([
        defaultEventTarget.hasEventListener(type),
        definedEventTarget ? definedEventTarget.hasEventListener(type) : Promise.resolve(false)
    ])
    return hasDefault || hasDefined
}

export function setEnvironmentEventTarget(eventTarget: EventTarget | undefined) {
    definedEventTarget = eventTarget
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
