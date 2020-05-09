import { Event } from "../events/event/event"

export interface ErrorContext extends Error {
    causedBy?: Error
    dispatcher?: Event
}

export interface EnvironmentError extends ErrorContext {
    name: "EnvironmentError"
}

export interface DispatcherError extends ErrorContext {
    name: "DispatcherError"
}

export interface AuthorizationError extends ErrorContext {
    name: "AuthorizationError"
}

export interface NetworkError extends ErrorContext {
    name: "NetworkError"
}

export interface InvalidStateError extends ErrorContext {
    name: "InvalidStateError"
}

export interface AbortError extends ErrorContext {
    name: "AbortError"
}

export function isAbortError(error: Error): error is AbortError {
    return error.name === "AbortError"
}

export interface EventAlreadyDispatchedError extends ErrorContext {
    name: "EventAlreadyDispatchedError"
}