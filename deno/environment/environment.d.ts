import { EventCallback, Event } from "../events/events";
import { EnvironmentEventTarget } from "./events";
import { EnvironmentEvents } from "../events/events";
export * from "./events";
export * from "./context";
export interface EnvironmentClosable {
    close(): void;
}
export interface AbortControllerLike {
    signal: unknown;
    abort: unknown;
}
export interface Environment extends EnvironmentEventTarget {
    readonly name: string;
    runInAsyncScope(fn: () => void | Promise<void>): Promise<void>;
    configure?(): void | Promise<void>;
    postConfigure?(): void | Promise<void>;
    addEnvironment(environment: Environment): void;
    addService(promise: Promise<unknown>): void;
    addClosable(closable: EnvironmentClosable): void;
    addAbortController(controller: AbortControllerLike): void;
    waitForServices(): Promise<void>;
    end(): Promise<void>;
}
export declare class Environment extends EnvironmentEventTarget implements Environment {
    #private;
    readonly name: string;
    constructor(name: string);
}
export declare function addEventListener<Type extends (keyof EnvironmentEvents & string)>(type: Type, callback: EventCallback<EnvironmentEvents[Type] & Event<Type>>): void;
export declare function addEventListener<E extends Event, This = unknown>(type: E["type"], callback: EventCallback<E, This>): void;
export declare function addEventListener(type: string, callback: EventCallback): void;
export declare function removeEventListener(type: string, callback: Function): void;
export declare function dispatchEvent<Type extends (keyof EnvironmentEvents & string)>(event: EnvironmentEvents[Type] & Event<Type>): Promise<void>;
export declare function hasEventListener(type: string, callback?: Function): Promise<boolean | undefined>;
export declare function getEnvironment(): Environment;
export declare function setEnvironment(fn: () => Environment | undefined): void;
export declare function runInEnvironment<T>(environment: Environment, fn: () => Promise<T> | T): Promise<T>;
