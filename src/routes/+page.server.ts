import { fail, redirect } from '@sveltejs/kit';

import type {PageServerLoad, Actions } from "./$types";
import * as strapi from "$lib/server/strapi";


export const load: PageServerLoad = async () => {
  const [homeData, services] = await Promise.all([
    strapi.getHomePage(),
    strapi.getServices()
  ])

  return { homeData, services };
};


export const actions: Actions = {
};
