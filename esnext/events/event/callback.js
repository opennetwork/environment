export function matchEventCallback(type, callback) {
    return descriptor => (!callback || callback === descriptor.callback) && type === descriptor.type;
}
