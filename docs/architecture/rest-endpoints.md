# REST Endpoints


Read Check: production upgrade. One caveat

You're right — **no language model in this resource group.** Confirmed from your inventory:

| Resource | Type |
|----------|------|
| `appi-…` | Application Insights |
| `ca-pizza-mcp-…` | Container App (the MCP server) |
| `cae-…` | Container Apps Environment |
| `cosmos-…` | Cosmos DB |
| `crr…` | Container Registry |
| `dash-…` | Shared dashboard |
| `func-pizza-api-…` | Function App (REST API) |
| `func-registration-api-…` | Function App |
| `id-pizza-mcp-…` | Managed Identity |
| `log-…` | Log Analytics workspace |
| `pizza-webapp` | Static Web App (front end) |
| `plan-…` ×2 | App Service plans |
| `registration-webapp` | Static Web App |
| `str…` | Storage account |

**No Azure OpenAI, no Content Safety, no Cognitive Services.** So the app's "natural language" isn't processed by any LLM here — it's just free-text fields (pizza nicknames/notes) stored and passed through. There's nothing AI-based to govern *yet*.

## What this clarifies

The "NL" in the front end is **user-entered text**, not model I/O. That's actually a **great fit for Content Safety** — you'd screen that user text for abuse before it's stored/processed. But it requires provisioning the Content Safety resource (none exists).

## Important: this is shared infra, outside the pizza project

You said it yourself — Content Safety would be **shared across many apps** and **shouldn't live in the pizza RG**. That makes provisioning it a **separate infrastructure decision**, not part of "finishing the pizza backend."

So two honest paths:

1. **Provision shared Content Safety now** (in a new `rg-shared-ai`) → then I build the APIM content-safety policy that screens the free-text field. Completes the content-safety layer.
2. **Defer content safety** (since the shared resource is a broader infra decision) and instead **close the MCP backend with rate limiting** — which needs no new resources and is already written.

Given you wanted the **backend complete** and content safety needs net-new shared infra, my recommendation: **finish rate limiting now** (zero dependencies, marks a governance layer done), and treat **Content Safety as a deliberate shared-infra provisioning task** you do when you're ready to stand up `rg-shared-ai`.

Your action: pick —
- **"rate limiting"** → I'll have you paste the parked policy and demo the 429s (backend effectively complete), or
- **"provision content safety"** → spin up the shared resource, then I build the screening policy.




Read Check: solve browser auth later

Yes — correct. The REST endpoints **exist and are running**. Let me state it plainly.

## The REST endpoints exist in three places

1. **In the project code** — each is a file in functions:
   - pizzas-get.ts → `GET /api/pizzas`
   - orders-get.ts → `GET /api/orders`
   - orders-post.ts → `POST /api/orders`
   - toppings-get.ts → `GET /api/toppings`
   - …and the rest (11 total).

2. **Deployed and live** — they run in the Function App `func-pizza-api-rgx6n3tlqbfzq` (the one in your resource group screenshot). Base URL:
   `https://func-pizza-api-rgx6n3tlqbfzq.azurewebsites.net/api/...`

3. **Described by an OpenAPI spec** — openapi.yaml, also served live at `GET /api/openapi`.

So they're real, deployed, callable today — independent of APIM.

## What "register" means here
Right now those endpoints are hit **directly** (the front end calls the Function App URL). "Registering them in APIM" means putting the **same governance gateway** in front of them that you just built for the MCP server:

```
Today:   pizza-webapp ──────────────► func-pizza-api  (/api/orders)
After:   pizza-webapp ──► APIM ──────► func-pizza-api  (governed)
```

Same pattern you did for MCP (backend → API → operations), just for the REST API. The fast way is importing the existing OpenAPI so all 11 operations get created at once.

Did I misread your question? If you meant something different by "exist" — e.g. you're not seeing them somewhere specific (APIM? the webapp? the portal?) — tell me where you're looking and I'll reconcile.

Your action: confirm you want to **register this existing REST API into APIM** (same as we did for MCP), and I'll start the import walkthrough — or tell me what part isn't matching what you see.


Read Check: solve browser auth later

Yes — correct. The REST endpoints **exist and are running**. Let me state it plainly.

## The REST endpoints exist in three places

1. **In the project code** — each is a file in functions:
   - pizzas-get.ts → `GET /api/pizzas`
   - orders-get.ts → `GET /api/orders`
   - orders-post.ts → `POST /api/orders`
   - toppings-get.ts → `GET /api/toppings`
   - …and the rest (11 total).

2. **Deployed and live** — they run in the Function App `func-pizza-api-rgx6n3tlqbfzq` (the one in your resource group screenshot). Base URL:
   `https://func-pizza-api-rgx6n3tlqbfzq.azurewebsites.net/api/...`

3. **Described by an OpenAPI spec** — openapi.yaml, also served live at `GET /api/openapi`.

So they're real, deployed, callable today — independent of APIM.

## What "register" means here
Right now those endpoints are hit **directly** (the front end calls the Function App URL). "Registering them in APIM" means putting the **same governance gateway** in front of them that you just built for the MCP server:

```
Today:   pizza-webapp ──────────────► func-pizza-api  (/api/orders)
After:   pizza-webapp ──► APIM ──────► func-pizza-api  (governed)
```

Same pattern you did for MCP (backend → API → operations), just for the REST API. The fast way is importing the existing OpenAPI so all 11 operations get created at once.

Did I misread your question? If you meant something different by "exist" — e.g. you're not seeing them somewhere specific (APIM? the webapp? the portal?) — tell me where you're looking and I'll reconcile.

Your action: confirm you want to **register this existing REST API into APIM** (same as we did for MCP), and I'll start the import walkthrough — or tell me what part isn't matching what you see.


=====


So, just be to clear. It makes more sense to import the OpenAPI spec here, as opposed to taking the backend approach?

Compacted conversationRead Check: APIM's importer is

Great question — and yes, but let me be precise about *why*, because the two approaches aren't actually mutually exclusive.

## They solve two different problems

| | **"Import OpenAPI"** | **"Backend" approach (what we did for MCP)** |
|---|---|---|
| What it creates | The **API surface** — all 11 operations, paths, methods, params, schemas | The **routing target** — where APIM forwards the call |
| Why we used it | REST has a machine-readable spec describing every endpoint | MCP has **one** endpoint (`POST /mcp`); no spec to import |

## Why import makes sense for REST

For MCP there was **nothing to import** — it's a single `POST /mcp` operation, so we hand-built it and pointed it at a named backend. Cheap.

For REST you have **11 operations** with paths, methods, query params, and response schemas. Typing those by hand would be tedious and error-prone. The OpenAPI spec already describes all of it, so import does that work for you in one shot.

## You still want a named backend — they work *together*

Import gets you the **operations**, but I'd still recommend adding the named backend afterward, exactly like MCP:

1. **Import OpenAPI** → creates the 11 operations + sets a backend URL inline.
2. **Create `pizza-rest-backend`** (named backend → Function App host).
3. **`set-backend-service backend-id="pizza-rest-backend"`** at All-operations scope → overrides the inline URL.

Why bother with step 2–3 when import already sets a URL? Because a **named backend** is reusable, centrally managed, and survives re-imports — the inline URL is buried in each operation and gets clobbered if you re-import the spec. Same reasoning that made the MCP All-operations policy survive operation edits.

**So the honest answer:** import *instead of* hand-building operations — yes. But still layer the named backend on top for clean routing. Import = the *what*, backend = the *where*.

Your action: go ahead with the OpenAPI import (steps 1–5 from before); once the 11 operations appear, we'll add `pizza-rest-backend` + `set-backend-service` so routing matches the MCP pattern.