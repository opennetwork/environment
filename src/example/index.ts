import "./fetch";
import "./storage";
import {addEventListener} from "../environment/environment";

addEventListener("complete", () => {
    console.log("Everything else executed");
});
