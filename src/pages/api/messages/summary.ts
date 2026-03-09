import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/prisma";
import { contactStatusSchema } from "@/server/messageStatusSchema";

type SummaryResponse = {
  ok: true;
  statuses: Record<string, number>;
  services: Array<{ service: string; newCount: number }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<SummaryResponse | any>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const serviceRaw = Array.isArray(req.query.service) ? req.query.service[0] : req.query.service;
  const service = serviceRaw && serviceRaw.trim() && serviceRaw !== "all" ? serviceRaw.trim() : undefined;

  // counts by status (optionally scoped to service)
  const byStatus = await prisma.contactMessage.groupBy({
    by: ["status"],
    where: {
      ...(service ? { service } : {}),
    },
    _count: { _all: true },
  });

  const statuses: Record<string, number> = {};
  for (const s of contactStatusSchema.options) statuses[s] = 0;
  for (const row of byStatus) statuses[row.status] = row._count._all;

  // service list + NEW counts (global, not affected by current service filter)
  const byServiceNew = await prisma.contactMessage.groupBy({
    by: ["service"],
    where: { status: "NEW" },
    _count: { _all: true },
  });

  const services = byServiceNew
    .map((r) => ({ service: r.service, newCount: r._count._all }))
    .sort((a, b) => a.service.localeCompare(b.service));

  return res.status(200).json({ ok: true, statuses, services });
}
