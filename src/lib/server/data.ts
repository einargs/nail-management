import { randomUUID } from "crypto";
import * as table from "./db/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

import { LOCATION_ID, square } from "./square";

export async function createCustomer(client: table.ClientBase): Promise<table.Client> {
  let idempotencyKey = randomUUID();

  let localId = randomUUID();

  let {errors, customer} = await square.customers.create({
    idempotencyKey,
    givenName: client.name,
    emailAddress: client.email ?? undefined,
    phoneNumber: client.phone ?? undefined,
    referenceId: localId
  });
  if (errors) {
    console.error("Square errors creating client", errors);
    throw Error("square errors");
  }
  if (customer === undefined) throw Error("Square did not return customer or errors");
  if (customer.id === undefined) throw Error("No square id");

  let result = await db.insert(table.client).values({
    ...client,
    squareId: customer.id,
    id: localId,
  }).returning();
  return result[0];
}

export async function createItem(base: table.ItemBase): Promise<table.Item> {
  let result = await db.insert(table.item).values({
    ...base,
    id: randomUUID(),
  }).returning();
  return result[0];
}

export async function updateItem(id: string, base: table.ItemBase): Promise<table.Item> {
  let result = await db.update(table.item).set({
    ...base
  }).where(eq(table.item.id, id)).returning();
  return result[0];
}
