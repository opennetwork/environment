import { run } from "./runner"
import { dispatchEvent } from "../environment/environment"

export default run({ })
    .catch(error => dispatchEvent({ type: "error", error }))
