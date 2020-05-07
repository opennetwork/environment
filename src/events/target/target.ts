import { Event } from "../event/event"
import {Environment, getEnvironment} from "../../environment/environment"

export interface EventCallback<TargetEvent extends Event = Event, This = unknown> {
    (this: This, event: TargetEvent): Promise<void> | void
}

export interface EventTarget<This = unknown> {
    addEventListener(type: string, callback: EventCallback<Event, This>): void
    removeEventListener(type: string, callback: EventCallback<Event, This>): void
    dispatchEvent(event: Event): void | Promise<void>
    hasEventListener(type: string): Promise<boolean>
}

export type AddEventListenerFn = EventTarget["addEventListener"]
export type RemoveEventListenerFn = EventTarget["removeEventListener"]
export type DispatchEventListenerFn = EventTarget["dispatchEvent"]
export type HasEventListenerFn = EventTarget["hasEventListener"]

export class EventTarget implements EventTarget {

    #listeners: Record<string, EventCallback[]> = {}
    #thisValue: unknown
    #environment: Environment | undefined

    constructor(thisValue: unknown = undefined, environment: Environment | undefined = undefined) {
        this.#thisValue = thisValue
        this.#environment = environment
    }

    addEventListener(name: string, callback: EventCallback) {
        let listeners = this.#listeners[name] || []
        if (listeners.includes(callback)) {
            return
        }
        listeners = listeners.slice()
        listeners.push(callback)
        this.#listeners[name] = listeners
    }

    removeEventListener(name: string, callback: EventCallback) {
        let listeners = this.#listeners[name]
        if (!listeners) {
            return
        }
        const index = listeners.indexOf(callback)
        if (index === -1) {
            return
        }
        listeners = listeners.slice()
        listeners.splice(index, 1)
        this.#listeners[name] = listeners
    }

    async dispatchEvent(event: Event) {
        const wildcardListeners = this.#listeners["*"] || []
        const listeners = (this.#listeners[event.type] || []).concat(wildcardListeners)
        if (!listeners.length) {
            return
        }
        for (const fn of listeners) {
            const environment = this.#environment || getEnvironment()
            if (environment) {
                await environment.runInAsyncScope(async () => {
                    await fn.call(this.#thisValue, event)
                })
            } else {
                await fn.call(this.#thisValue, event)
            }
        }
    }

    async hasEventListener(type: string) {
        const listeners = this.#listeners[type]
        return !!(listeners && listeners.length)
    }
}
