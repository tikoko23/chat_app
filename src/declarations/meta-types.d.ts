import { JSONValue } from "./util-types.d.ts"

export interface EndpointMeta {
    method: "GET" | "POST"
    exec: ((req: Request) => Promise<Response> | Response) | ((req: Request, post: Record<string, JSONValue>) => Promise<Response> | Response)
}

export interface DynamicPageMeta {
    exec: (req: Request) => Response | Promise<Response>
}