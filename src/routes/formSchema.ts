import { z } from "zod";

export const addClientSchema = z.object({
  email: z.email(),
  name: z.string(),
  phone: z.string() // make phone number validator
});

export type AddClientSchema = typeof addClientSchema;

export const addItemSchema = z.object({
  name: z.string(),
  cost: z.int(),
  quantity: z.int(),
  reorderThreshold: z.int()
});


export const updateItemSchema = z.object({
  id: z.uuid(),
  cost: z.int(),
  name: z.string(),
  quantity: z.int(),
  reorderThreshold: z.int()
});
