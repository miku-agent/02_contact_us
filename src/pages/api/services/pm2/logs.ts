import type { NextApiRequest, NextApiResponse } from "next";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { access } from "node:fs/promises";

const execFileAsync = promisify(execFile);

async function resolveLogPath(serviceName: string, type: "out" | "err") {
  const { stdout } = await execFileAsync("pm2", ["jlist"], { timeout: 5000 });
  const raw = JSON.parse(stdout) as Array<Record<string, any>>;
  const match = raw.find((item) => String(item.name ?? "") === serviceName);
  if (!match) return null;

  const env = match.pm2_env ?? {};
  const path = type === "err" ? env.pm_err_log_path : env.pm_out_log_path;
  return typeof path === "string" && path.length > 0 ? path : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const nameRaw = Array.isArray(req.query.name) ? req.query.name[0] : req.query.name;
  const typeRaw = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
  const linesRaw = Array.isArray(req.query.lines) ? req.query.lines[0] : req.query.lines;

  if (!nameRaw || typeof nameRaw !== "string") {
    return res.status(400).json({ ok: false, error: "VALIDATION_ERROR", field: "name" });
  }

  const type = typeRaw === "err" ? "err" : "out";
  const lines = Math.max(1, Math.min(1000, Number(linesRaw ?? 100)));

  try {
    const logPath = await resolveLogPath(nameRaw, type);
    if (!logPath) {
      return res.status(404).json({ ok: false, error: "LOG_NOT_FOUND" });
    }

    await access(logPath);
    const { stdout } = await execFileAsync("tail", ["-n", String(lines), logPath], { timeout: 5000 });
    return res.status(200).json({ ok: true, logs: stdout });
  } catch (e) {
    console.error("[pm2] log fetch failed", e);
    return res.status(500).json({ ok: false, error: "LOG_FETCH_FAILED" });
  }
}
