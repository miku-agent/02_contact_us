import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/prisma";
import { contactStatusSchema } from "@/server/messageStatusSchema";

const DEFAULT_TAKE = 50;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const statusRaw = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
  const serviceRaw = Array.isArray(req.query.service) ? req.query.service[0] : req.query.service;
  const takeRaw = Array.isArray(req.query.take) ? req.query.take[0] : req.query.take;

  const statusParsed = statusRaw ? contactStatusSchema.safeParse(statusRaw) : ({ success: true, data: "NEW" } as const);
  if (!statusParsed.success) {
    return res.status(400).json({ ok: false, error: "VALIDATION_ERROR", field: "status" });
  }

  const service = serviceRaw && serviceRaw.trim() ? serviceRaw.trim() : undefined;
  const take = Math.max(1, Math.min(DEFAULT_TAKE, Number(takeRaw ?? DEFAULT_TAKE) || DEFAULT_TAKE));

  const where = {
    status: statusParsed.data,
    ...(service ? { service } : {}),
  };

  const items = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      service: true,
      name: true,
      email: true,
      message: true,
      status: true,
      createdAt: true,
    },
  });

  return res.status(200).json({ ok: true, items });
}
