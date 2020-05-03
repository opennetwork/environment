import {addEventListener, ConfigureEventType} from "../../environment/environment"

addEventListener(ConfigureEventType, async function initiateIdentityStoreDefault() {
    if (!await this.identity.has("current")) {
        await this.identity.set("current", { id: "anonymous" })
    }
})
