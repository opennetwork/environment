import { Event } from "../event/event"
import { Environment } from "../../environment/environment"

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

    private listeners: Record<string, EventCallback[]> = {}

    constructor(private thisValue: unknown = undefined, private environment: Environment | undefined = undefined) {
    }

    addEventListener(name: string, callback: EventCallback) {
        let listeners = this.listeners[name] || []
        if (listeners.includes(callback)) {
            return
        }
        listeners = listeners.slice()
        listeners.push(callback)
        this.listeners[name] = listeners
    }

    removeEventListener(name: string, callback: EventCallback) {
        let listeners = this.listeners[name]
        if (!listeners) {
            return
        }
        const index = listeners.indexOf(callback)
        if (index === -1) {
            return
        }
        listeners = listeners.slice()
        listeners.splice(index, 1)
        this.listeners[name] = listeners
    }

    async dispatchEvent(event: Event) {
        const listeners = this.listeners[event.type]
        console.log(`Dispatching event ${event.type}`, listeners, this.thisValue, event)
        if (!(listeners && listeners.length)) {
            return
        }
        for (const fn of listeners) {
            if (this.environment) {
                await this.environment.runInAsyncScope(async () => {
                    await fn.call(this.thisValue, event)
                })
            } else {
                await fn.call(this.thisValue, event)
            }
        }
    }

    async hasEventListener(type: string) {
        const listeners = this.listeners[type]
        return !!(listeners && listeners.length)
    }
}
