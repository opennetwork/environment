import { getEnvironment } from "../environment/environment.js";
import { createFlag, getFlags } from "./config.js";
export * from "./config.js";
export * from "./flag.js";
const environmentFlags = new WeakMap();
export function hasFlag(flag) {
    if (!getFlags().has(flag)) {
        return false;
    }
    const environment = getEnvironment();
    if (!environment) {
        return false;
    }
    const flags = environmentFlags.get(environment);
    return !!(flags && flags.has(flag));
}
export function setFlag(flag) {
    if (!getFlags().has(flag)) {
        const autoCreate = hasFlag("ENVIRONMENT_AUTO_CREATE_FLAG");
        if (!autoCreate) {
            return;
        }
        createFlag(flag);
    }
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required to set flag");
    }
    let flags = environmentFlags.get(environment);
    if (!flags) {
        flags = new Set();
        environmentFlags.set(environment, flags);
    }
    flags.add(flag);
}
export function removeFlag(flag) {
    const environment = getEnvironment();
    if (!environment) {
        return;
    }
    const flags = environmentFlags.get(environment);
    if (!flags) {
        return;
    }
    flags.delete(flag);
}
