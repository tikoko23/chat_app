import { addFile } from "../cdn.ts";
import { EndpointMeta } from "../types.d.ts";

const requestMeta: EndpointMeta = {
    method: "POST",
    exec: (req: Request): Promise<Response> => {
        return addFile(req);
    }
}

export default requestMeta;