import { addEventListener } from "../environment/environment.js";
addEventListener("fetch-error", async ({ error }) => {
    // console.log({ fetchErrorCaught: error })
});
addEventListener("error", async ({ error }) => {
    console.log({ globalErrorCaught: error });
});
