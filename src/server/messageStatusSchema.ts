import { z } from "zod";

export const contactStatusSchema = z.enum(["NEW", "DONE", "ARCHIVED", "SPAM"]);
export type ContactStatus = z.infer<typeof contactStatusSchema>;

export const updateMessageStatusSchema = z.object({
  status: contactStatusSchema,
});
export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>;
