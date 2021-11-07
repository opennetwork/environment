import type { APIGatewayEvent, APIGatewayProxyResult, APIGatewayProxyResultV2 } from "aws-lambda";
export declare function handlerAPIGateway(event: APIGatewayEvent): Promise<APIGatewayProxyResult | APIGatewayProxyResultV2<never>>;
export declare function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult | APIGatewayProxyResultV2<never>>;
