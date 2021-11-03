import {h, createFragment} from "@virtualstate/fringe";
import {addEventListener} from "../environment/environment";

addEventListener("render", async ({ render }) => {
    await render(
        <>
        <html>
            <head>
                <title>Web Page</title>
            </head>
            <body>
            <p>
                Some Content
            </p>
            </body>
        </html>
        </>
    );
});
