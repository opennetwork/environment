import { Environment as EnvironmentTemplate } from "../../environment/environment";
import { BrowserStoreOptions } from "./storage/local";
export declare const BrowserEnvironmentConfig: unique symbol;
interface BrowserEnvironmentConfig {
    storage?: BrowserStoreOptions | false;
}
interface BrowserEnvironmentConfigWindow {
    [BrowserEnvironmentConfig]: BrowserEnvironmentConfig;
}
declare global {
    interface Window extends BrowserEnvironmentConfigWindow {
    }
}
export declare class Environment extends EnvironmentTemplate {
    constructor(name?: string);
    configure(): Promise<void>;
    configureWithConfig(config: BrowserEnvironmentConfig): Promise<void>;
    static getEnvironment(): Environment | undefined;
}
export {};
