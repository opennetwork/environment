import { addEventListener } from "../environment/environment";

addEventListener("fetch-error", async ({ error, ...rest }) => {
    console.trace({ fetchErrorCaught: error, ...rest })
});
addEventListener("error", async ({ error, ...rest }) => {
    console.trace({ globalErrorCaught: error, ...rest })
    throw "huh";
});
