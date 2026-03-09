import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/server/prisma";
import { contactSchema } from "@/server/contactSchema";
import { sendContactMail } from "@/server/mailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "VALIDATION_ERROR",
      issues: parsed.error.flatten(),
    });
  }

  const { service, name, email, message } = parsed.data;

  const saved = await prisma.contactMessage.create({
    data: { service, name, email, message },
    select: { id: true },
  });

  try {
    await sendContactMail({ name, email, message });
  } catch (e) {
    // DB 저장이 우선. 메일 실패는 로깅만 하고 성공으로 처리.
    console.error("[contact] mail send failed", e);
  }

  return res.status(200).json({ ok: true, id: saved.id });
}
