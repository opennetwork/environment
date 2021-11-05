import type {APIGatewayEvent, APIGatewayProxyResult, APIGatewayProxyResultV2} from "aws-lambda";
import { run } from "../runner";
import {dispatchFetchEvent} from "../../fetch/fetch";
import {Request} from "@opennetwork/http-representation";
import AbortController from "abort-controller";
import {defer} from "../../deferred";

export async function handlerAPIGateway(event: APIGatewayEvent) {
  const controller = new AbortController();
  const { resolve, promise } = defer<APIGatewayProxyResult | APIGatewayProxyResultV2>();
  await run({
      event,
      AWS_LAMBDA: true,
      async execute() {
          const url = new URL(event.path, `${event.requestContext.protocol}://${event.requestContext.domainName}`)
          const request = new Request(url.toString(), {
              method: event.httpMethod,
              body: event.body,
              headers: Object.fromEntries(
                  Object.entries(event.headers ?? {}).filter(([key, value]) => typeof value === "string" || Array.isArray(value))
              )
          });
          const [, responsePromise] = await dispatchFetchEvent({
              request,
              abortTimeout: 300000,
              signal: controller.signal,
              type: "fetch",
          });
          const response = await responsePromise;
          resolve({
              statusCode: response.status,
              body: await response.text(),
              headers: {
                  ...Object.fromEntries(response.headers.entries())
              }
          });
      }
  });
  return await promise;
}

function isEventLike(event: object): event is Record<string, unknown> {
    return !!event;
}

function isAPIGatewayEvent(event: object): event is APIGatewayEvent {
    return !!(isEventLike(event) && event.requestContext && event.httpMethod && event.path);
}

export async function handler(event: APIGatewayEvent) {
  if (isAPIGatewayEvent(event)) {
      return handlerAPIGateway(event);
  }
  throw new Error("Unknown AWS Lambda event type");
}
