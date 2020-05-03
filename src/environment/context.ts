import {IdentityStore} from "../authentication/authentication"

declare interface EnvironmentContext {
    identity: IdentityStore
    [key: string]: unknown
    [key: number]: unknown
}

export {
    EnvironmentContext
}

export function createContext(): EnvironmentContext {
    return {
        identity: new IdentityStore()
    }
}
