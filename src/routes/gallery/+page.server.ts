
import { fail, redirect } from '@sveltejs/kit';

import type {PageServerLoad, Actions } from "./$types";
import * as strapi from "$lib/server/strapi";


export const load: PageServerLoad = async () => {
  const galleryData = await strapi.getGalleryPage();

  return { galleryData };
};


export const actions: Actions = {
};
