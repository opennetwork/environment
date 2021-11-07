import { getEnvironment } from "../environment/environment.js";
const flags = new WeakMap();
export function getFlags() {
    const environment = getEnvironment();
    if (!environment) {
        throw new Error("Environment required to use FlagContext");
    }
    let set = flags.get(environment);
    if (!set) {
        set = new Set();
        flags.set(environment, set);
    }
    return set;
}
export function ensureFlag(flag) {
    if (getFlags().has(flag)) {
        return;
    }
    createFlag(flag);
}
export function createFlag(flag) {
    const set = getFlags();
    if (set.has(flag)) {
        throw new Error("Flag already exists");
    }
    set.add(flag);
}
export function resetFlag(flag) {
    const set = getFlags();
    if (!set.has(flag)) {
        return;
    }
    set.delete(flag);
}
