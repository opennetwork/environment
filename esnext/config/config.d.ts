import { Environment, ExecuteEvent } from "../environment/environment";
import { Event } from "../events/events";
declare global {
    interface EnvironmentConfig {
        environment?: Environment;
        execute?(event: ExecuteEvent): void | Promise<void>;
    }
}
export interface ConfigUpdateEvent extends Event<"config:update"> {
    config: Readonly<EnvironmentConfig>;
}
declare global {
    interface EnvironmentEvents {
        "config:update": ConfigUpdateEvent;
    }
}
export { EnvironmentConfig };
export declare function getEnvironmentConfig(): EnvironmentConfig;
export declare function setEnvironmentConfig(environmentConfig: EnvironmentConfig): Promise<void>;
