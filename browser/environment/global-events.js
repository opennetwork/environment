export const addGlobalEventListener = typeof addEventListener === "undefined" ? undefined : addEventListener;
export const removeGlobalEventListener = typeof removeEventListener === "undefined" ? undefined : removeEventListener;
const dispatchGlobalEventInternal = typeof dispatchEvent === "undefined" ? undefined : dispatchEvent;
function dispatchGlobalEventImplementation(event) {
    if (isNativeIshEvent(event))
        return this(event);
    const nativeTemplate = createEvent();
    const nativeEvent = new Proxy(nativeTemplate, {
        get(target, p) {
            if (isInternalEventKey(p))
                return event[p];
            if (isNativeEventKey(p))
                return target[p];
            return undefined;
            function isInternalEventKey(p) {
                return typeof p === "string" && p in event;
            }
            function isNativeEventKey(p) {
                return typeof p === "string" && p in target;
            }
        }
    });
    return this(nativeEvent);
    function createEvent() {
        if (window.CustomEvent) {
            return new window.CustomEvent(event.type);
        }
        return document.createEvent(event.type);
    }
    function isNativeIshEvent(value) {
        return typeof document === "undefined" || value instanceof Event;
    }
}
export const dispatchGlobalEvent = dispatchGlobalEventInternal ? dispatchGlobalEventImplementation.bind(dispatchGlobalEventInternal) : undefined;
