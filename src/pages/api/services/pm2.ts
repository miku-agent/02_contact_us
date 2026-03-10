import type { NextApiRequest, NextApiResponse } from "next";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type Pm2ListItem = {
  id: number;
  name: string;
  status: string;
  instances: number;
  execMode?: string;
  version?: string;
  restartTime?: number;
  uptime?: number | null;
  cpu?: number | null;
  memory?: number | null;
};

async function fetchPm2List(): Promise<Pm2ListItem[]> {
  const { stdout } = await execFileAsync("pm2", ["jlist"], { timeout: 5000 });
  const raw = JSON.parse(stdout) as Array<Record<string, any>>;

  return raw.map((item) => {
    const env = item.pm2_env ?? {};
    const monit = item.monit ?? {};

    return {
      id: Number(item.pm_id ?? 0),
      name: String(item.name ?? "unknown"),
      status: String(env.status ?? "unknown"),
      instances: Number(env.instances ?? 1),
      execMode: env.exec_mode ? String(env.exec_mode) : undefined,
      version: env.version ? String(env.version) : undefined,
      restartTime: typeof env.restart_time === "number" ? env.restart_time : undefined,
      uptime: typeof env.pm_uptime === "number" ? env.pm_uptime : null,
      cpu: typeof monit.cpu === "number" ? monit.cpu : null,
      memory: typeof monit.memory === "number" ? monit.memory : null,
    };
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const items = await fetchPm2List();
    return res.status(200).json({ ok: true, items });
  } catch (e) {
    console.error("[pm2] list failed", e);
    return res.status(500).json({ ok: false, error: "PM2_LIST_FAILED" });
  }
}
