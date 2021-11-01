import "./fetch";
import "./storage";
import "./flags";
import {addEventListener} from "../environment/environment";

addEventListener("complete", () => {
    console.log("Everything else executed");
});
