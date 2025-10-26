import { randomUUID } from "crypto";
import * as schema from "./db/schema";
import { db } from "./db";

import { LOCATION_ID, square } from "./square";

export async function createCustomer(client: schema.ClientBase) {
  let idempotencyKey = randomUUID();

  let localId = randomUUID();

  square.customers.create({
    idempotencyKey,
    givenName: client.name,
    emailAddress: client.email ?? undefined,
    phoneNumber: client.phone ?? undefined,
    referenceId: localId
  });
}
