import "dotenv/config";
import * as ngrok from "ngrok";

const PORT = Number(process.env.PORT || 5000);
const RETELL_BASE = "https://api.retellai.com";
const WEBHOOK_PATH = "/api/interviews/webhook";
const NGROK_API_URL = "http://127.0.0.1:4040/api/tunnels";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getNgrokUrlFromApi() {
  await wait(2000);

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const res = await fetch(NGROK_API_URL);
      if (!res.ok) {
        throw new Error(`ngrok API returned ${res.status}`);
      }

      const body: any = await res.json();
      const tunnel = body?.tunnels?.find((t: any) => t?.proto === "https") ||
        body?.tunnels?.[0];
      if (tunnel?.public_url) return tunnel.public_url as string;

      throw new Error("ngrok API returned no tunnels");
    } catch (error) {
      lastError = error;
      if (attempt < 10) await wait(1000);
    }
  }

  throw new Error(
    `Unable to read ngrok tunnel URL from ${NGROK_API_URL}: ${String(lastError)}`
  );
}

async function updateRetellWebhook(webhookUrl: string) {
  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_AGENT_ID;

  if (!apiKey) throw new Error("RETELL_API_KEY is required");
  if (!agentId) throw new Error("RETELL_AGENT_ID is required");

  const res = await fetch(`${RETELL_BASE}/update-agent/${agentId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webhook_url: webhookUrl }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Retell webhook update failed (${res.status}): ${text || res.statusText}`
    );
  }
}

async function main() {
  await ngrok.connect(PORT);
  const ngrokUrl = await getNgrokUrlFromApi();
  const webhookUrl = `${ngrokUrl}${WEBHOOK_PATH}`;

  await updateRetellWebhook(webhookUrl);

  console.log(`[setupWebhook] ngrok URL: ${ngrokUrl}`);
  console.log(`[setupWebhook] Retell webhook URL: ${webhookUrl}`);
  console.log("[setupWebhook] Tunnel is running. Keep this process alive during testing.");
}

main().catch(async (error) => {
  console.error("[setupWebhook] error:", error);
  await ngrok.kill().catch(() => undefined);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await ngrok.kill().catch(() => undefined);
  process.exit(0);
});

setInterval(() => undefined, 60_000);
