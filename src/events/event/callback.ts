import {Event} from "./event"

export interface EventCallback<TargetEvent extends Event = Event, This = unknown> {
    (this: This, event: TargetEvent): Promise<void> | void
}
