import { db } from '$lib/server/db';

import type {PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async () => {
  const clients = await db.query.client.findMany({});

  return { clients };
};

export const actions: Actions = {
  async addAppointment() {

  }
};
