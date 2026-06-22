# Identity

Read Check: an independent quota. Great

## Roadmap status

1. ✅ Backend
2. ✅ API + POST /mcp
3. ✅ Pass-through tested
4. ✅ Product + Subscription (key-gated)
5. ✅ Observability (App Insights)
6. 🔖 Rate limiting — *parked, coming back*
7. ⬜ **Auth (JWT validation)** ← next
8. ⬜ Content safety
9. ⬜ (later) REST backend as MCP — second effort

## Next: Auth (JWT validation)

You already have **subscription-key** auth from the Product step (a shared secret). The next governance layer is **identity-based auth** — `validate-jwt` checks a real OAuth 2.0 / Entra ID bearer token on each call, so only authenticated principals reach the MCP server.

This is especially relevant for MCP because the spec defines an **OAuth authorization flow** for clients — APIM is the natural place to enforce it.

**Before I give you the policy, I need a couple facts (multiple valid setups):**

1. **Identity provider** — Microsoft Entra ID, or something else (Auth0, Okta, etc.)?
2. Do you already have an **app registration / API scope** for this (issuer + audience), or do we need to note that as a prerequisite?
3. For the demo, do you want **real token validation**, or a **simulated/relaxed** version (validate structure but not a live issuer) just to show the policy mechanics?

> Heads-up: full `validate-jwt` needs a real issuer + signing keys (OpenID metadata URL) and audience. If you don't have an Entra app reg handy, we can either create one or do a "demo-mode" JWT check to illustrate the policy without standing up identity infra.

Alternatively, if auth is heavier than you want right now, we can **jump to Content Safety** (often the more visually compelling MCP demo — blocking malicious tool inputs).

Your action: tell me either (a) your **identity provider + whether an app reg exists** so I can build the `validate-jwt` policy, or (b) **"skip to content safety"** and we'll do that layer next.