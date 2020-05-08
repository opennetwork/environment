import { Event } from "../event/event"
import { Environment, getEnvironment } from "../../environment/environment"
import { getEvent, runWithEvent } from "../event/dispatcher"
import {getEventContext, EventListener, hasEventContext} from "../event/context"
import { EventCallback } from "../event/callback"
import { EventDescriptor } from "../event/descriptor"
import { matchEventCallback } from "../event/callback"

export {
    EventCallback
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

export class EventTarget implements EventTarget {

    #listeners: EventDescriptor[] = []
    readonly #thisValue: unknown
    readonly #environment: Environment | undefined

    constructor(thisValue: unknown = undefined, environment: Environment | undefined = undefined) {
        this.#thisValue = thisValue
        this.#environment = environment
    }

    addEventListener(type: string, callback: EventCallback) {
        const listener: EventListener = {
            isListening: () => !!this.#listeners.find(matchEventCallback(type, callback)),
            descriptor: {
                type,
                callback
            }
        }
        if (listener.isListening()) {
            return
        }
        this.#listeners.push(listener.descriptor)
        const parentEvent = getEvent()
        if (parentEvent) {
            const parentEventContext = getEventContext(parentEvent)
            parentEventContext.listeners.push(listener)
        }
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
        const parentEvent = getEvent()
        const environment = this.#environment || getEnvironment()

        if (environment && hasEventContext(event)) {
            // TODO decide if we should just do this anyway, it might lead to some confusing things happening so I think it is better to straight up disallow it
            // In some cases users may expect their `this` scope to stay the same for the events methods, e.g. if the event was created as a class, so this should lead
            // to them creating a new one or if the event class has a clone function..
            throw new Error(`Event ${event.type} has already been dispatched, by design we have excluded this pattern as we utilise the event object instance to create unique weak contexts. To dispatch the event again, utilise the spread syntax if the event is an object as so:\n\nawait dispatchEvent({ ...event })\n\nIf the event creating using a constructor, please re-create or clone the event before invoking dispatchEvent again for this event instance`)
        }

        if (!listeners.length) {
            if (!parentEvent) {
                return
            }
            const parentEventContext = getEventContext(parentEvent)
            parentEventContext.dispatchedEvents.push({
                target: this,
                event
            })
        }

        if (environment && parentEvent) {
            const eventContext = getEventContext(event)
            eventContext.dispatcher = parentEvent
        }

        await runWithEvent(event, async () => {
            for (const descriptor of listeners) {
                if (environment && parentEvent) {
                    const parentEventContext = getEventContext(parentEvent)
                    parentEventContext.dispatchedEvents.push({
                        target: this,
                        event,
                        descriptor
                    })
                }
                if (environment) {
                    await environment.runInAsyncScope(async () => {
                        await descriptor.callback.call(this.#thisValue, event)
                    })
                } else {
                    await descriptor.callback.call(this.#thisValue, event)
                }
            }
        })
    }

    async hasEventListener(type: string, callback?: EventCallback) {
        const foundIndex = this.#listeners.findIndex(matchEventCallback(type, callback))
        return foundIndex > -1
    }
}
