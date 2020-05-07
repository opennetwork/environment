import { Event } from "../event/event"
import { Environment, getEnvironment } from "../../environment/environment"

export interface EventCallback<TargetEvent extends Event = Event, This = unknown> {
    (this: This, event: TargetEvent): Promise<void> | void
}

export interface EventTarget<This = unknown> {
    addEventListener(type: string, callback: EventCallback<Event, This>): void
    removeEventListener(type: string, callback: EventCallback<Event, This>): void
    dispatchEvent(event: Event): void | Promise<void>
    hasEventListener(type: string, callback?: EventCallback): Promise<boolean>
}

export type AddEventListenerFn = EventTarget["addEventListener"]
export type RemoveEventListenerFn = EventTarget["removeEventListener"]
export type DispatchEventListenerFn = EventTarget["dispatchEvent"]
export type HasEventListenerFn = EventTarget["hasEventListener"]

let increment = 0

export interface EventDescriptor {
    sequence: number
    type: string
    callback: EventCallback
}

function matchEventCallback(type: string, callback?: EventCallback): (descriptor: EventDescriptor) => boolean {
    return descriptor => (!callback || callback === descriptor.callback) && type === descriptor.type
}

export class EventTarget implements EventTarget {

    #listeners: EventDescriptor[] = []
    #thisValue: unknown
    #environment: Environment | undefined

    constructor(thisValue: unknown = undefined, environment: Environment | undefined = undefined) {
        this.#thisValue = thisValue
        this.#environment = environment
    }

    addEventListener(type: string, callback: EventCallback) {
        const hasListener = !!this.#listeners.find(matchEventCallback(type, callback))
        if (hasListener) {
            return
        }
        increment += 1
        this.#listeners.push({
            sequence: increment,
            callback,
            type
        })
    }

    removeEventListener(type: string, callback: EventCallback) {
        const index = this.#listeners.findIndex(matchEventCallback(type, callback))
        if (index === -1) {
            return
        }
        this.#listeners.splice(index, 1)
    }

    async dispatchEvent(event: Event) {
        const listeners = this.#listeners.filter(descriptor => descriptor.type === event.type || descriptor.type === "*")
        if (!listeners.length) {
            return
        }
        for (const descriptor of listeners) {
            const environment = this.#environment || getEnvironment()
            if (environment) {
                await environment.runInAsyncScope(async () => {
                    await descriptor.callback.call(this.#thisValue, event)
                })
            } else {
                await descriptor.callback.call(this.#thisValue, event)
            }
        }
    }

    async hasEventListener(type: string, callback?: EventCallback) {
        const foundIndex = this.#listeners.findIndex(matchEventCallback(type, callback))
        return foundIndex > -1
    }
}
