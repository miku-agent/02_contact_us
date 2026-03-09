import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/prisma";
import { updateMessageStatusSchema } from "@/server/messageStatusSchema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idRaw = req.query.id;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  if (!id) {
    return res.status(400).json({ ok: false, error: "VALIDATION_ERROR", field: "id" });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const parsed = updateMessageStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "VALIDATION_ERROR",
      issues: parsed.error.flatten(),
    });
  }

  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: parsed.data.status },
      select: {
        id: true,
        status: true,
      },
    });

    return res.status(200).json({ ok: true, item: updated });
  } catch (e: unknown) {
    // Prisma: Record to update not found.
    if (typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2025") {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    throw e;
  }
}
