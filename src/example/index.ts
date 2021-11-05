import "./error";
import "./render";
import "./fetch";
import "./storage";
import "./flags";
import "./test";
import {addEventListener} from "../environment/environment";

addEventListener("complete", () => {
    console.log("Everything else executed");
});

const { default: promise } = await import("../runtime/run.js");
await promise;
