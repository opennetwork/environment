import { run } from "./runner.js";
import { dispatchEvent } from "../environment/environment.js";
export default run({})
    .catch(error => dispatchEvent({ type: "error", error }));
