# Product and Subscription

MCP
Sub ID:
Ocp-Apim-Subscription-Key: 16c4218e4d304a839dc76f271c259e9c

REST
Sub ID:
Ocp-Apim-Subscription-Key: 8b23d9a0d9e7406385db21d58c411df1



Read Check: keeps session state in

All four steps passed end-to-end through APIM — initialize (200 + session), initialized (202), tools/list (full catalog), and tool calls (pizzas, toppings, empty orders `[]`). Pass-through is fully proven. 🎯

Now let's add the **Product + Subscription** so clients have a governed access key.

## Step A — Create the Product

**1.** APIM → left nav **Products** → **+ Add**.

**2.** Fill in:
- **Display name:** `Pizza MCP`
- **Id:** `pizza-mcp` (auto-fills)
- **Description:** *(optional)* `MCP server access for the Pizza demo`
- **Published:** ✅ **check** (unpublished = unusable)
- **Requires subscription:** ✅ **check**
- **Requires approval:** ⬜ **uncheck** (instant key, no admin approval for the demo)
- **Subscription count limit:** leave blank

**3.** Under **APIs** (in the same Add Product blade) → **+ Add** → select **Pizza MCP** → confirm.

**4.** Click **Create**.

## Step B — Create a named Subscription

**5.** APIM → left nav **Subscriptions** → **+ Add subscription**.

**6.** Fill in:
- **Name:** `pizza-mcp-key`
- **Display name:** `Pizza MCP Key`
- **Scope:** **Product** → select **Pizza MCP**
- **User:** leave default (admin)

**7.** Click **Create**.

**8.** Open `pizza-mcp-key` → reveal/copy the **Primary key**. This is the `Ocp-Apim-Subscription-Key` value clients send.

## What changes after this
Once the API is inside a subscription-required Product, calls need the key header:
```
Ocp-Apim-Subscription-Key: <primary key>
```
The Portal **Test** tab adds it automatically, but external clients (MCP Inspector, agents) must include it.

> Note: your API may currently be attached to the built-in **Unlimited/Starter** product too. For a clean demo, you can later remove it from those so the **only** path in is via `Pizza MCP`. Not required now.

Your action: complete Steps A & B, copy the **Primary key**, then re-run Step 1 (initialize) on the Test tab to confirm it still returns 200 with the subscription key applied — tell me the result and we move to governance (observability first).


=========



Read Check: separate from the MCP

Different sub. Each Product has its own subscriptions/keys — a Pizza REST subscription gives a key scoped to REST only. Keeping REST and MCP keys separate means you can rotate or revoke one without breaking the other.

Create it under the **Pizza REST** product: Subscriptions → **+ Add** → name `pizza-rest-key` → Save → copy primary key.

Your action: add the `pizza-rest-key` subscription, then test **GET /pizzas** with header `Ocp-Apim-Subscription-Key: <key>`.