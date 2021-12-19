import {addEventListener} from "../environment/environment";
import {dispatchFetchEvent, fetch} from "../fetch/fetch";
import {Request} from "@opennetwork/http-representation";
import {v4} from "uuid";
import "./once.test";

// addEventListener("test", () => console.log("Execute tests"));

addEventListener("test", async () => {
    const [, promise] = await dispatchFetchEvent({
        request: new Request("/ping", {
            method: "GET"
        }),
        type: "fetch"
    });
    const response = await promise;
    const ping = await response.text();
    if (ping !== "Pong") {
        console.log({ ping });
        throw new Error("Expected Pong");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/pong", {
        method: "GET"
    });
    const pong = await response.text();
    if (pong !== "Ping") {
        console.log({ pong });
        throw new Error("Expected Ping");
    }
})

// A maybe idea

addEventListener("test", async () => {
    const response = await fetch("https://example.com", {
        method: "GET"
    });
    const example = await response.text();
    if (example !== "Example.com contents!") {
        console.log({ example });
        throw new Error("Expected example.com");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/data", {
        method: "GET"
    });
    const { data } = await response.json();
    if (data !== "value!") {
        console.log({ data });
        throw new Error("Expected data");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/data", {
        method: "PUT",
        body: JSON.stringify({
            data: "input!"
        })
    });
    const { data } = await response.json();
    if (data !== "value!") {
        console.log({ data });
        throw new Error("Expected data");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/view", {
        method: "GET"
    });
    const view = await response.text();
    if (!view.startsWith("<!DOCTYPE html>\n<html")) {
        console.log({ view });
        throw new Error("Expected html view");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/template?id=1", {
        method: "GET"
    });
    const template = await response.text();
    if (!template.startsWith("<template")) {
        console.log({ template });
        throw new Error("Expected template");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/500", {
        method: "GET"
    });
    if (response.status !== 500) {
        console.log({ uncaughtStatus: response.status });
        throw new Error("Expected 500");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/uncaught-error", {
        method: "GET"
    });
    if (response.status !== 500) {
        console.log({ uncaughtStatus: response.status });
        throw new Error("Expected 500");
    }
})

addEventListener("test", async () => {
    const response = await fetch("/uncaught-error-inner", {
        method: "GET"
    });
    if (response.status !== 500) {
        console.log({ uncaughtStatus: response.status });
        throw new Error("Expected 500");
    }
})

addEventListener("test", async () => {
    const identifier = v4();
    const input = {
        '@type': 'type',
        identifier,
        name: `Name for ${identifier}`
    } as const;
    const body = JSON.stringify(input);
    const putResponse = await fetch(`/store/type/${input.identifier}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body
    });
    if (!putResponse.ok) throw new Error("PUT not ok");
    const getResponse = await fetch(`/store/type/${input.identifier}`, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    });
    const got = await getResponse.json();
    if (!getResponse.ok) throw new Error("GET not ok");
    if (Object.entries(input).find(([key, value]) => got[key] !== value ? key : undefined)) {
        console.log({ got, input });
        throw new Error("Expected matching response");
    }
})
