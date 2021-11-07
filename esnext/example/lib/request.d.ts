import { Event } from "../../events/event/event";
export interface RequestEventMatcherFn<T> {
    (value: T): boolean;
}
export declare type RequestEventMatcher = string | RegExp | RequestEventMatcherFn<string>;
export interface RequestEventHandlerOptions {
    method?: RequestEventMatcher;
    hash?: RequestEventMatcher;
    host?: RequestEventMatcher;
    hostname?: RequestEventMatcher;
    href?: RequestEventMatcher;
    origin?: RequestEventMatcher;
    password?: RequestEventMatcher;
    pathname?: RequestEventMatcher;
    port?: RequestEventMatcher;
    protocol?: RequestEventMatcher;
    search?: RequestEventMatcher;
    searchParams?: RequestEventMatcherFn<URLSearchParams>;
    username?: RequestEventMatcher;
}
export declare function isUrlEvent<O extends object>(event: O): event is O & {
    url: URL;
};
export declare function assertOrDefineRequestEventUrl<O extends object, T extends URL>(event: O, url: T): asserts event is O & {
    url: T;
};
export declare function assertRequestEventUrl<O extends object>(event: O): asserts event is O & {
    url: URL;
};
export declare function addRequestEventHandler<T extends string, E extends Event<T>>(type: T, options: RequestEventHandlerOptions, fn: ((event: E) => Promise<void> | void)): void;
