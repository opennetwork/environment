import {h, createFragment} from "@virtualstate/fringe";
import {addEventListener} from "../environment/environment";

addEventListener("render", async ({ render }) => {
    await render(
        <html>
            <head>
                <title>My Website</title>
            </head>
            <body>
                <h1>Hello!</h1>
                <main>
                    <p key="huh">Content here</p>
                    <p attr={false} other={true} value={1} one="two">Content there</p>
                </main>
                <footer>
                    <a href="https://example.com" target="_blank">example.com</a>
                </footer>
                <script type="module" src="/browser-script">  </script>
            </body>
        </html>
    );
});
