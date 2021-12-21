# @opennetwork/environment

Cross platform JavaScript environment

[//]: # (badges)

![nycrc config on GitHub](https://img.shields.io/nycrc/virtualstate/x) ![41.56%25 lines covered](https://img.shields.io/badge/lines-41.56%25-yellow) ![41.56%25 statements covered](https://img.shields.io/badge/statements-41.56%25-yellow) ![53.1%25 functions covered](https://img.shields.io/badge/functions-53.1%25-yellow) ![70.6%25 branches covered](https://img.shields.io/badge/branches-70.6%25-yellow)

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
