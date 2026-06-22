# Pizza MCP — APIM Portal Spot Tests

Validate the Pizza MCP server through Azure API Management using the **Portal → APIs → Pizza MCP → Test** console. These steps assume you are familiar with the APIM Portal and the Test page.

> The MCP protocol is **stateful**: you must `initialize` first, capture the returned session id, send the `initialized` notification, then call tools — every follow-up call must echo the session id header.

---

## Endpoint

| Item | Value |
|------|-------|
| Gateway URL | `https://playground-basic1-apim.azure-api.net/pizza-mcp/mcp` |
| Operation | `POST /mcp` |

## Required headers (set on EVERY call)

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Accept` | `application/json, text/event-stream` |

After Step 1 you add one more header to **every** later call:

| Header | Value |
|--------|-------|
| `Mcp-Session-Id` | *(the id returned by Step 1)* |

> If APIM enforces a subscription key, also add `Ocp-Apim-Subscription-Key: <your key>`. The Portal Test page injects this automatically.

---

## Step 1 — Initialize (start the session)

**Headers:** `Content-Type`, `Accept` (as above).

**Body:**
```json
{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": { "protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": { "name": "apim-test", "version": "1.0" } } }
```

**Expected:** `200 OK`, `content-type: text/event-stream`, and a response header **`mcp-session-id: <guid>`**. The body reports `serverInfo.name = "pizza-mcp"`.

        HTTP/1.1 200 OK
        cache-control: no-cache
        content-type: text/event-stream
        date: Sun, 21 Jun 2026 21:06:36 GMT
        mcp-session-id: 22b8b556-302f-46a0-9321-225508f730e9
        transfer-encoding: chunked
        vary: Origin
        x-powered-by: Express
            
        event: message
        data: {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"pizza-mcp","description":"Pizza tools to interact with the pizza API. Use these tools whenever you need information about pizzas, toppings, and orders. You can also use them to place new pizza orders and manage existing orders.","version":"1.0.0"}},"jsonrpc":"2.0","id":1}

➡️ **Copy the `mcp-session-id` value** from the response headers — you need it for every step below.

---

## Step 2 — Confirm the session (initialized notification)

**Headers:** `Content-Type`, `Accept`, **`Mcp-Session-Id`** (the id from Step 1).

**Body** (a notification — note: no `id` field):
```json
{ "jsonrpc": "2.0", "method": "notifications/initialized" }
```

**Expected:** `202 Accepted` with an empty body. This completes the handshake; the session is now ready for tool calls.


        HTTP request
        POST https://playground-basic1-apim.azure-api.net/pizza-mcp/mcp HTTP/1.1
        Host: playground-basic1-apim.azure-api.net
        Accept: application/json, text/event-stream
        Content-Type: application/json
        Mcp-Session-Id: 22b8b556-302f-46a0-9321-225508f730e9

        { "jsonrpc": "2.0", "method": "notifications/initialized" }
        HTTP response
        Message
        Trace
        Generate definition
        HTTP/1.1 202 Accepted
        content-length: 0
        date: Sun, 21 Jun 2026 21:09:48 GMT
        vary: Origin
        x-powered-by: Express
---

## Step 3 — List available tools

**Headers:** `Content-Type`, `Accept`, `Mcp-Session-Id`.

**Body:**
```json
{ "jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {} }
```
**Expected:** `200 OK` with a `result.tools` array listing the pizza tools (e.g. `get_pizzas`, `get_toppings`, `get_orders`, `place_order`, …). Use the exact names returned here for Step 4.

        HTTP/1.1 200 OK
        cache-control: no-cache
        content-type: text/event-stream
        date: Sun, 21 Jun 2026 21:10:32 GMT
        mcp-session-id: 22b8b556-302f-46a0-9321-225508f730e9
        transfer-encoding: chunked
        vary: Origin
        x-powered-by: Express
            
        event: message
        data: {"result":{"tools":[{"name":"get_pizzas","description":"Get a list of all pizzas in the menu","inputSchema":{"type":"object","properties":{}}},{"name":"get_pizza_by_id","description":"Get a specific pizza by its ID","inputSchema":{"type":"object","properties":{"id":{"type":"string","description":"ID of the pizza to retrieve"}},"required":["id"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}},{"name":"get_toppings","description":"Get a list of all toppings in the menu","inputSchema":{"type":"object","properties":{"category":{"type":"string","descri
---

## Step 4 — Call individual tools

All use **Headers:** `Content-Type`, `Accept`, `Mcp-Session-Id`.

### 4a — Get pizzas
```json
{ "jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": { "name": "get_pizzas", "arguments": {} } }
```

        HTTP/1.1 200 OK
        cache-control: no-cache
        content-type: text/event-stream
        date: Sun, 21 Jun 2026 21:11:36 GMT
        mcp-session-id: 22b8b556-302f-46a0-9321-225508f730e9
        transfer-encoding: chunked
        vary: Origin
        x-powered-by: Express
            
        event: message
        data: {"result":{"content":[{"type":"text","text":"[{\"id\":\"1\",\"name\":\"Margherita\",\"description\":\"Classic Italian pizza with tomato sauce, fresh mozzarella, and basil leaves. A beloved traditional favorite.\",\"price\":12,\"imageUrl\":\"https://func-pizza-api-rgx6n3tlqbfzq.azurewebsites.net/api/images/pizza-pic-1.jpg\",\"toppings\":[\"2\",\"1\",\"7\"]},{\"id\":\"2\",\"name\":\"Pepperoni\",\"description\":\

### 4b — Get toppings
```json
{ "jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": { "name": "get_toppings", "arguments": {} } }
```

        HTTP/1.1 200 OK
        cache-control: no-cache
        content-type: text/event-stream
        date: Sun, 21 Jun 2026 21:12:22 GMT
        mcp-session-id: 22b8b556-302f-46a0-9321-225508f730e9
        transfer-encoding: chunked
        vary: Origin
        x-powered-by: Express
            
        event: message
        data: {"result":{"content":[{"type":"text","text":"[{\"id\":\"1\",\"name\":\"Mozzarella\",\"description\":\"Classic Italian cheese, mild and creamy, perfect for pizza melting.\",\"price\":1.5,\"imageUrl\":\"https://func-pizza-api-rgx6n3tlqbfzq.azurewebsites.net/api/images/topping-pic-1.jpg\",\"category\":\"cheese\"},{\"id\":\"2\",\"name\":\"San Marzano Tomato Sauce\",\"description\":\"Rich tomato sauce made fr


### 4c — Get orders
```json
{ "jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": { "name": "get_orders", "arguments": {} } }
```

**Expected (each):** `200 OK` with a `result.content` array containing the tool's output (pizza list, topping list, or order list).

        HTTP/1.1 200 OK
        cache-control: no-cache
        content-type: text/event-stream
        date: Sun, 21 Jun 2026 21:13:25 GMT
        mcp-session-id: 22b8b556-302f-46a0-9321-225508f730e9
        transfer-encoding: chunked
        vary: Origin
        x-powered-by: Express
            
        event: message
        data: {"result":{"content":[{"type":"text","text":"[]"}]},"jsonrpc":"2.0","id":5}
---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "No valid session ID provided" on Step 1 | Missing `Content-Type: application/json`, so the server didn't parse the body | Add the `Content-Type` header and resend |
| `406 Not Acceptable` | Missing/incorrect `Accept` header | Set `Accept: application/json, text/event-stream` |
| "Session not found" on a follow-up | Wrong/missing `Mcp-Session-Id`, or the Portal Test console hit fresh in-memory state | Re-run Step 1, copy the new session id; for full interactive testing use MCP Inspector |
| `404 Not Found` | Operation path/suffix mismatch | Confirm URL is `…/pizza-mcp/mcp` and operation is `POST /mcp` |
| `500 / 502` | Backend routing problem | Verify `set-backend-service backend-id="pizza-mcp-backend"` and the backend Runtime URL |

> **Note:** The Portal Test console fires one isolated request at a time and the MCP server keeps session state in memory, so multi-step sequences can be fragile. For a smooth interactive demo, point **MCP Inspector** (Streamable HTTP transport) at the gateway URL — it manages the session automatically.
