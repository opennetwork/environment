import { Environment } from "./environment";
export declare const EnvironmentContextSymbol: unique symbol;
declare global {
    interface EnvironmentContext {
        type: typeof EnvironmentContextSymbol;
        [key: string]: unknown;
        [key: number]: unknown;
    }
}
export { EnvironmentContext };
export declare function createEnvironmentContext(): EnvironmentContext;
export declare function getEnvironmentContext(environment?: Environment | undefined): EnvironmentContext;
