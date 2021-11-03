import {h, createFragment} from "@virtualstate/fringe";
import {addEventListener} from "../environment/environment";

addEventListener("render", async ({ render }) => {
    await render(<p>Hello World!</p>);
});
