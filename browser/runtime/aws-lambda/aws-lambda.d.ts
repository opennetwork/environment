import { Environment as EnvironmentTemplate } from "../node/node";
export declare class Environment extends EnvironmentTemplate {
    constructor();
    configure(): Promise<void>;
}
