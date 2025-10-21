import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from "drizzle-orm";
import * as schemas from "./formSchema";

import type {PageServerLoad, Actions } from "./$types";
import {requireLogin} from "$lib/server/auth";


export const load: PageServerLoad = async () => {
  let user = requireLogin();
  const addClientForm = await superValidate({
    name: "test",
    email: "etest@gmail.com",
    phone: "1234567000",
  }, zod4(schemas.addClientSchema));
  const addItemForm = await superValidate({
    name: "test item 1",
    cost: 1000,
    quantity: 10,
    reorderThreshold: 2
  }, zod4(schemas.addItemSchema));
  const updateItemForm = await superValidate({
    //id: 0,
    //name: "test item 1",
    //cost: 1000,
    //quantity: 10,
    //reorderThreshold: 2
  }, zod4(schemas.updateItemSchema));
  const clients = await db.select().from(table.client);
  const items = await db.select().from(table.item);
  console.log("items", items);

  return { user, clients, items, addClientForm, addItemForm, updateItemForm };
};


export const actions: Actions = {
  updateItem: async (event) => {
    console.log("update Item action called");
    const form = await superValidate(event.request, zod4(schemas.updateItemSchema));
    console.log("updateItem", form);
    if (!form.valid) return fail(500, { updateItemForm: form });

    try {
      let result = await db.update(table.item).set({
        reorderThreshold: form.data.reorderThreshold,
        cost: form.data.cost,
        quantity: form.data.quantity,
        name: form.data.name
      }).where(eq(table.item.id, form.data.id));
      console.log("updated item", result);
      // todo: throw error if it didn't change anything.
    } catch (error) {
      console.error("error adding item", error);
      return fail(500, { updateItemForm: form });
    }
    return message(form, "Item added successfully");
  },
  addItem: async (event) => {
    const form = await superValidate(event.request, zod4(schemas.addItemSchema));
    console.log("form", form);
    if (!form.valid) return fail(500, { addItemForm: form });

    try {
      let result = await db.insert(table.item).values({
        ...form.data
      });
      console.log("add item", result);
    } catch (error) {
      console.error("error adding item", error);
      return fail(500, { addItemForm: form });
    }
    return message(form, "Item added successfully");
  },
  addClient: async (event) => {
    const form = await superValidate(event.request, zod4(schemas.addClientSchema));
    console.log("form", form);
    if (!form.valid) return fail(500, { addClientForm: form });

    try {
      let result = await db.insert(table.client).values({
        name: form.data.name,
        email: form.data.email,
        phone: form.data.phone
      });
      console.log(result);
    } catch (error) {
      console.error("error adding client", error);
      return fail(500, { addClientForm: form });
    }
    return message(form, "Client added successfully");
  },
};
