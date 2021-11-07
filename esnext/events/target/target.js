import { getEnvironment } from "../../environment/environment.js";
import { getEvent, runWithEvent } from "../event/dispatcher.js";
import { getEventContext, hasEventContext } from "../event/context.js";
import { matchEventCallback } from "../event/callback.js";
import { runWithSpanOptional, trace } from "../../tracing/span.js";
import { isParallelEvent } from "../parallel-event.js";
import { isSignalEvent } from "../signal-event.js";
import { isAbortError } from "../../errors/errors.js";
function isFunctionEventCallback(fn) {
    return typeof fn === "function";
}
export class EventTarget {
    #listeners = [];
    #thisValue;
    #environment;
    constructor(thisValue = undefined, environment = undefined) {
        this.#thisValue = thisValue;
        this.#environment = environment;
    }
    addEventListener(type, callback) {
        const listener = {
            isListening: () => !!this.#listeners.find(matchEventCallback(type, callback)),
            descriptor: {
                type,
                callback
            },
            timestamp: Date.now()
        };
        if (listener.isListening()) {
            return;
        }
        this.#listeners.push(listener.descriptor);
        const parentEvent = getEvent();
        if (parentEvent) {
            const parentEventContext = getEventContext(parentEvent);
            parentEventContext.listeners.push(listener);
        }
    }
    removeEventListener(type, callback) {
        if (!isFunctionEventCallback(callback)) {
            return;
        }
        const index = this.#listeners.findIndex(matchEventCallback(type, callback));
        if (index === -1) {
            return;
        }
        this.#listeners.splice(index, 1);
    }
    async dispatchEvent(event) {
        const listeners = this.#listeners.filter(descriptor => descriptor.type === event.type || descriptor.type === "*");
        await runWithSpanOptional(`event_dispatch`, { attributes: { type: event.type, listeners: listeners.length } }, async () => {
            // Don't even dispatch an aborted event
            if (isSignalEvent(event) && event.signal.aborted) {
                return;
            }
            function isEnvironmentIsh(environment) {
                function isEnvironmentLike(environment) {
                    return !!environment;
                }
                return isEnvironmentLike(environment) && typeof environment.runInAsyncScope === "function";
            }
            const parentEvent = getEvent();
            const eventEnvironment = event.environment;
            const environment = isEnvironmentIsh(eventEnvironment) ? eventEnvironment : this.#environment || getEnvironment();
            if (environment && hasEventContext(event)) {
                // TODO decide if we should just do this anyway, it might lead to some confusing things happening so I think it is better to straight up disallow it
                // In some cases users may expect their `this` scope to stay the same for the events methods, e.g. if the event was created as a class, so this should lead
                // to them creating a new one or if the event class has a clone function..
                const error = new Error(`Event ${event.type} has already been dispatched, by design we have excluded this pattern as we utilise the event object instance to create unique weak contexts. To dispatch the event again, utilise the spread syntax if the event is an object as so:\n\nawait dispatchEvent({ ...event })\n\nIf the event creating using a constructor, please re-create or clone the event before invoking dispatchEvent again for this event instance`);
                error.name = "EventAlreadyDispatchedError";
                throw error;
            }
            if (!listeners.length) {
                if (!parentEvent) {
                    return;
                }
                const parentEventContext = getEventContext(parentEvent);
                parentEventContext.dispatchedEvents.push({
                    target: this,
                    event,
                    timestamp: Date.now()
                });
            }
            if (environment && parentEvent) {
                const eventContext = getEventContext(event);
                eventContext.dispatcher = parentEvent;
            }
            await runWithEvent(event, async () => {
                const parallel = isParallelEvent(event);
                const promises = [];
                for (let index = 0; index < listeners.length; index += 1) {
                    const descriptor = listeners[index];
                    if (!parallel && !this.#listeners.includes(descriptor)) {
                        continue;
                    }
                    if (environment && parentEvent) {
                        const parentEventContext = getEventContext(parentEvent);
                        parentEventContext.dispatchedEvents.push({
                            target: this,
                            event,
                            descriptor,
                            timestamp: Date.now()
                        });
                    }
                    const promise = runWithSpanOptional("event_dispatched", { attributes: { type: event.type, listener: index } }, async () => {
                        if (environment) {
                            await environment.runInAsyncScope(async () => {
                                await descriptor.callback.call(this.#thisValue, event);
                            });
                        }
                        else {
                            await descriptor.callback.call(this.#thisValue, event);
                        }
                    });
                    if (!parallel) {
                        try {
                            await promise;
                        }
                        catch (error) {
                            if (!isSignalHandled(event, error)) {
                                await Promise.reject(error);
                            }
                            else {
                                trace("error_handled", { handled: 1 });
                            }
                        }
                        if (isSignalEvent(event) && event.signal.aborted) {
                            // bye
                            return;
                        }
                    }
                    else {
                        promises.push(promise);
                    }
                }
                if (promises.length) {
                    // Allows for all promises to settle finish so we can stay within the event, we then
                    // will utilise Promise.all which will reject with the first rejected promise
                    const results = await Promise.allSettled(promises);
                    const rejected = results.filter((result) => {
                        return result.status === "rejected";
                    });
                    if (rejected.length) {
                        let unhandled = rejected;
                        // If the event was aborted, then allow abort errors to occur, and handle these as handled errors
                        // The dispatcher does not care about this because they requested it
                        //
                        // There may be other unhandled errors that are more pressing to the task they are doing.
                        //
                        // The dispatcher can throw an abort error if they need to throw it up the chain
                        if (isSignalEvent(event) && event.signal.aborted) {
                            const before = unhandled.length;
                            unhandled = unhandled.filter(result => !isSignalHandled(event, result.reason));
                            const handled = before - unhandled.length;
                            if (handled) {
                                trace("error_handled", { handled });
                            }
                        }
                        if (unhandled.length === 1) {
                            await Promise.reject(unhandled[0]);
                            throw unhandled[0]; // We shouldn't get here
                        }
                        else if (unhandled.length > 1) {
                            throw new AggregateError(unhandled);
                        }
                    }
                }
            });
        });
    }
    async hasEventListener(type, callback) {
        if (callback && !isFunctionEventCallback(callback)) {
            return;
        }
        const foundIndex = this.#listeners.findIndex(matchEventCallback(type, callback));
        return foundIndex > -1;
    }
}
export function isSignalHandled(event, error) {
    if (isSignalEvent(event) && event.signal.aborted && error instanceof Error && isAbortError(error)) {
        return true;
    }
}
