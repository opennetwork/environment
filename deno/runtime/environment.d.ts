import { Environment } from "../environment/environment";
export interface EnvironmentRuntimeDetail {
    getEnvironment?(): Environment | undefined;
    environment: Environment;
}
export declare function getRuntimeEnvironmentDetail(config: EnvironmentConfig): Promise<EnvironmentRuntimeDetail>;
export declare function getRuntimeEnvironment(config: EnvironmentConfig): Promise<Environment>;
