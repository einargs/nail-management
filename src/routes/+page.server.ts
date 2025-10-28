import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import * as schemas from "./formSchema";
import * as serverData from "$lib/server/data";

import type {PageServerLoad, Actions } from "./$types";
import {requireLogin} from "$lib/server/auth";
import { square, LOCATION_ID } from "$lib/server/square";


export const load: PageServerLoad = async () => {
  let user = requireLogin();
  const addClientForm = await superValidate({
    name: "test",
    email: "etest@gmail.com",
    phone: "408-647-4636",
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
  const clientsR = await db.query.client.findMany({
    with: { appointment: true }
  });
  let clients = clientsR.map(client => ({
    id: client.id,
    email: client.email,
    phone: client.phone,
    name: client.name,
    squareId: client.squareId,
  }));
  const items = await db.select().from(table.item);
  /*let services = await square.catalog.searchItems({
    productTypes: [ "APPOINTMENTS_SERVICE" ]
  });
  let hairColor = services.items![0];
  */

  return { user, clients, items, addClientForm, addItemForm, updateItemForm,   };
};


export const actions: Actions = {
  // you need the square plus to cancel bookings or send reminders
  addBooking: async (event) => {
    /*
    let services = await square.catalog.searchItems({
      productTypes: [ "APPOINTMENTS_SERVICE" ]
    });
    let hairColor = services.items![0];
    console.log(hairColor);
    */
    //const { result: { booking } } = await square.bookings.createBooking


    //console.log(services.items);
  },
  addAppointment: async (event) => {
    /*
    await db.select(table.client)
    await db.insert(table.appointment).values({
      clientId: 1,
      date: sql`now()`
    })
    console.log("called");
    */
  },
  updateItem: async (event) => {
    console.log("update Item action called");
    const form = await superValidate(event.request, zod4(schemas.updateItemSchema));
    console.log("updateItem", form);
    if (!form.valid) return fail(500, { updateItemForm: form });

    try {
      let result = await serverData.updateItem(form.data.id, {
        reorderThreshold: form.data.reorderThreshold,
        cost: form.data.cost,
        quantity: form.data.quantity,
        name: form.data.name
      });
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
      let result = serverData.createItem(form.data);
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
      let result = await serverData.createCustomer({
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
