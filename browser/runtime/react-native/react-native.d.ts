import { Environment as EnvironmentTemplate } from "../../environment/environment";
export declare class Environment extends EnvironmentTemplate {
    constructor(name?: string);
    static getEnvironment(): Environment | undefined;
}
