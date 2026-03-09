import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { prisma } from "@/server/prisma";

const bodySchema = z.object({
  id: z.string().min(1),
  archived: z.boolean(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "VALIDATION_ERROR" });
  }

  await prisma.contactMessage.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.archived ? "ARCHIVED" : "NEW" },
  });

  return res.status(200).json({ ok: true });
}
