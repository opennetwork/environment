import { FetchServiceConfig } from "./fetch-service"

declare global {

    interface EnvironmentConfig {
        fetchService?: FetchServiceConfig
    }

}

