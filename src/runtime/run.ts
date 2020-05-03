import { run } from "./runner"
import { dispatchEvent } from "../environment/environment"

export default run()
    .then(() => dispatchEvent({ type: "complete" }))
    .catch(error => dispatchEvent({ type: "error", error }))
