import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

function boolean() {
  return integer({mode: 'boolean'});
}

function timestamp() {
  return integer({mode: 'timestamp'});
}

function autoId() {
  return integer({mode: 'number'}).primaryKey({ autoIncrement: true });
}

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  age: integer('age'),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export const client = sqliteTable('client', {
  // this is a uuid
  id: text().primaryKey(),
  name: text().notNull(),
  email: text(),
  phone: text(),
  squareId: text(),
  birthday
});

// clients need reminders
// we're using the bullmq redis thing for that

export type Client = typeof client.$inferSelect;
export type ClientBase = Omit<Client, "id" | "squareId">;

export const clientRelations = relations(client, ({many}) => ({
  appointment: many(appointment)
}));

export const service = sqliteTable('service', {
  id: autoId(),
  name: text(),
  //TODO: image
  description: text(),
  squareId: text(),
  squareVariation: integer(),
});

export type Service = typeof service.$inferSelect;

export const appointment = sqliteTable('appointment', {
  id: autoId(),
  clientId: integer({mode:"number"}).notNull().references(() => client.id),
  date: timestamp().notNull(),
  serviceId: integer().notNull().references(() => service.id),
  durationMinutes: integer().notNull(),
});

export const appointmentRelations = relations(appointment, ({one}) => ({
  client: one(client, {
    fields: [appointment.clientId],
    references: [client.id]
  })
}));

export type Appointment = typeof appointment.$inferSelect;

export const item = sqliteTable('item', {
  id: autoId(),
  name: text().notNull(),
  // in cents
  cost: integer().notNull(),
  // quantity
  quantity: integer().default(0),
  // re-order threshold
  reorderThreshold: integer().notNull(),
});

export type Item = typeof item.$inferSelect;

// Does amber just want to note what items ran out?
// or does she want to track how much of every item
// was used
export const itemUsage = sqliteTable('itemUsage', {
  id: autoId(),
  itemId: integer().notNull().references(() => item.id),
  amountUsed: integer().notNull(),
  date: timestamp().notNull(),
});

export type ItemUsage = typeof itemUsage.$inferSelect;
