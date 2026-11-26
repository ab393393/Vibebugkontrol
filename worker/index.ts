import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { runWithRequestOrigin } from "../lib/request-origin.mjs";
import { renderRequest, secureResponse } from "../lib/security-headers.mjs";
import { pageFor } from "../lib/pages.mjs";
import { siteConfig } from "../lib/site-config";

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const nonce=crypto.randomUUID().replaceAll('-','');
    const renderingRequest=renderRequest(request,{nonce,development:import.meta.env.DEV});
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithRequestOrigin(request.url, () => runWithConnectorBinding(binding, async () => {
      const response=await handler.fetch(renderingRequest, env, ctx);
      const page=pageFor(new URL(request.url).pathname);
      return secureResponse(response,{nonce,development:import.meta.env.DEV,canonical:page?siteConfig().origin+page.path:''});
    }));
  },
};

export default worker;
