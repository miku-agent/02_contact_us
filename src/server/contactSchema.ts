import { z } from "zod";

export const contactSchema = z.object({
  // 서비스 식별자 (예: "miku-dashboard", "portfolio", "shop")
  service: z.string().trim().min(1).max(50).optional().default("default"),
  name: z.string().trim().min(1, "이름을 입력해 주세요").max(100),
  email: z.string().trim().email("이메일 형식이 올바르지 않아요").max(200),
  message: z.string().trim().min(1, "메시지를 입력해 주세요").max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
