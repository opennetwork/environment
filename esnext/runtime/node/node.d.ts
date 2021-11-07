import { Environment as EnvironmentTemplate } from "../../environment/environment";
export declare class Environment extends EnvironmentTemplate {
    constructor(name?: string);
    runInAsyncScope(fn: () => void | Promise<void>): Promise<void>;
    configure(): Promise<void>;
    postConfigure(): Promise<void>;
}
