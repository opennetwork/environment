import {EventCallback} from "./callback";

export interface EventDescriptor {
    type: string
    callback: EventCallback
}
