import { z } from "zod"

export const transactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(100),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be a positive number"),
  paid_by: z.enum(["owner", "mum"]),
  category: z.enum(["groceries", "transport", "bills", "dining", "household", "other"]),
  transaction_date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export const settleSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be a positive number"),
  paid_by: z.enum(["owner", "mum"]),
  settlement_date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
})

export type SettleFormValues = z.infer<typeof settleSchema>
