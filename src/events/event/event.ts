export interface Event<Name extends string = string> {
    type: Name
    [key: string]: unknown
    [key: number]: unknown
}
