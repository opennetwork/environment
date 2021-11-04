import {h, createFragment} from "@virtualstate/fringe";
import {addEventListener} from "../environment/environment";
import {fetch} from "../fetch/fetch";

addEventListener("render", async ({ render, signal }) => {
    signal.addEventListener("abort", () => void 0);

    const response = await fetch("/data", {
        method: "GET"
    });

    const data = await response.text();

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
                <script type="application/json" id="data">{data}</script>
                <script type="module">
                    {`
                    window.data = JSON.parse(
                        document.querySelector("script#data").textContent
                    );
                    `.trim()}
                </script>
                <script type="module" src="/browser-script">
                </script>
            </body>
        </html>
    );
});
