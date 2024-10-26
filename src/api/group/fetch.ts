import { fetchGroup, groupToResponse } from "../../group.ts";
import { EndpointMeta } from "../../types.d.ts";

const requestMeta: EndpointMeta = {
    method: "GET",
    exec: (req: Request): Response => {
        const url = new URL(req.url);
        const invite = url.searchParams.get("invite");

        if (invite === null)
            return new Response("Invite must be given", { status: 400 });

        const group = fetchGroup("invite", invite);

        if (group === null)
            return new Response("Invite not found", { status: 404 });

        const response = groupToResponse(group);

        return new Response(JSON.stringify(response), { status: 200 });
    }
};

export default requestMeta;
