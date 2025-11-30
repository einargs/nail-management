import { relations } from "drizzle-orm";
import { boolean, date, timestamp, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  strapiId: integer().notNull().unique(),
  // This is also the strapi username
  username: text('username').notNull().unique(),
  //passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp('expires_at').notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export const client = pgTable('client', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  email: text(),
  phone: text(),
  squareId: text().notNull(),
  //birthday: date(),
});

// clients need reminders
// we're using the bullmq redis thing for that


// TODO: address. Use Square.Address as a template example

export type Client = typeof client.$inferSelect;
export type ClientBase = Omit<Client, "id" | "squareId">;

export const clientRelations = relations(client, ({many}) => ({
  appointment: many(appointment)
}));

export const service = pgTable('service', {
  id: uuid().primaryKey(),
  name: text(),
  //TODO: image
  description: text(),
  squareId: text(),
  squareVariation: integer(),
});

export type Service = typeof service.$inferSelect;

export const address = pgTable('address', {
  id: uuid().primaryKey().notNull(),
  addressLine1: text().notNull(),
  addressLine2: text().notNull(),
  /// locality in square
  city: text().notNull(),
  /// administrativeDistrictLevel1 in square
  state: text().notNull(),
  //country
  postalCode: text().notNull(),
});

export type Address = typeof address.$inferSelect;
export type AddressBase = Omit<Address, "id">;

export const appointment = pgTable('appointment', {
  id: uuid().primaryKey(),
  clientId: uuid().notNull().references(() => client.id),
  addressId: uuid().notNull().references(() => address.id),
  date: timestamp().notNull(),
  serviceId: uuid().notNull().references(() => service.id),
  durationMinutes: integer().notNull(),
});

export const appointmentRelations = relations(appointment, ({one}) => ({
  client: one(client, {
    fields: [appointment.clientId],
    references: [client.id]
  }),
  address: one(address, {
    fields: [appointment.addressId],
    references: [address.id]
  }),
  service: one(service, {
    fields: [appointment.serviceId],
    references: [service.id]
  }),
}));

export type Appointment = typeof appointment.$inferSelect;

export const item = pgTable('item', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  // in cents
  cost: integer().notNull(),
  // quantity
  quantity: integer().notNull().default(0),
  // re-order threshold
  reorderThreshold: integer().notNull(),
});

export type Item = typeof item.$inferSelect;
export type ItemBase = Omit<Item, "id">;

// Does amber just want to note what items ran out?
// or does she want to track how much of every item
// was used
export const itemUsage = pgTable('itemUsage', {
  id: uuid().primaryKey(),
  itemId: uuid().notNull().references(() => item.id),
  amountUsed: integer().notNull(),
  date: timestamp().notNull(),
});

export type ItemUsage = typeof itemUsage.$inferSelect;
