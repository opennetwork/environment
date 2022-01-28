# @opennetwork/environment

Cross platform JavaScript environment

[//]: # (badges)

![nycrc config on GitHub](https://img.shields.io/nycrc/opennetwork/environment)

[//]: # (badges)

## Usage

```typescript
import {run, addEventListener, fetch} from "@opennetwork/environment"; 
import {Response} from "@opennetwork/http-representation";

addEventListener("install", async () => {
   console.log("Setup something!"); 
});

addEventListener("configure", async () => {
    console.log("Updated configuration for something!");
});

addEventListener("fetch", async (event) => {
    event.respondWith(new Response("Not Found", {
        status: 404
    }))
});

addEventListener("execute", async () => {
    const response = await fetch("/something");
    console.log("Response status: ", response.status);
    console.log("Done something!");
});

await run({
    /* config here */
})
```
