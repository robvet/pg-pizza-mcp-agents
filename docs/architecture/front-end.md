# Front-End

Let me look at how the front-end app calls the backend so I can give accurate wiring guidance.  

Read [](file:///Volumes/robvet-stuff/_vetCode/_ai/_demos-27/Pizza-Demos/MCP/pg-pizza-mcp-agents/src/pizza-webapp/src/orders.service.ts)

Searched for regex `apiBaseUrl|VITE_|import.meta.env|PIZZA_API` (`**/src/pizza-webapp/**`), 16 results

Found it. The front end is **`pizza-webapp`**, and here's the key insight:

## What the front end actually calls

It calls the **REST API directly — not the MCP server.**

- orders.service.ts: `fetch(\`${apiBaseUrl}/api/orders?...\`)`
- pizza-dashboard.ts: `apiBaseUrl = import.meta.env.VITE_PIZZA_API_URL`
- vite.config.ts: `VITE_PIZZA_API_URL = PIZZA_API_URL`

So it's a read-only **orders dashboard** that polls `GET /api/orders` against the Pizza **REST** API (`func-pizza-api-…azurewebsites.net`).

## What this means for "wiring the front end"

Putting this front end behind APIM = **the REST-backend effort** (your "second effort"), not the MCP one. The flow becomes:

```
pizza-webapp  →  APIM (Pizza REST API)  →  func-pizza-api (/api/orders)
                  governance applies here
```

You'd:
1. **Register the REST API in APIM** (backend → API → operations → `set-backend-service`), same pattern we just did for MCP.
2. **Repoint the front end**: set `VITE_PIZZA_API_URL` to the **APIM gateway URL** instead of the Functions URL.
3. Front-end calls now flow through APIM → governed + observable, same App Insights.

> Note: if APIM requires a subscription key, the browser front end must send `Ocp-Apim-Subscription-Key`. For a public read-only dashboard you may want this REST API's product to be **open / no key** (or use a header-injection policy), since exposing a key in browser JS isn't secure. Worth deciding.

## So the natural next move
This pivots us to the **REST backend registration** (the second effort) — which is also exactly what makes the front end "go through APIM." Two ways to register the REST API:

- **A — Manual** (backend + API + operations), same as MCP. Good learning continuity.
- **B — Import the OpenAPI** — `pizza-api` has openapi.yaml; APIM can import it and auto-generate all operations in one shot. Much faster for a multi-route REST API.

Your action: confirm the goal is **route `pizza-webapp` through APIM** (REST backend registration), and pick **A (manual)** or **B (import OpenAPI — faster)** — then I'll walk you through it. Also tell me whether this REST API should be **key-protected or open** (matters for the browser).
