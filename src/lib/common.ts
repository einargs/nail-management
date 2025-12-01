import { env } from "$env/dynamic/public";

export const squareUpURL: string = "https://app.squareup.com/appointments/book/nryr3yx01d27bt/L8AN6191J5V3E/start";

// TODO: figure out how to tie this to be dynamic but not expose
// every environment variable??
// Okay apparently you can prefix it with PUBLIC_ to list which
// environment variables should be exposed.
export const strapiURL: string = env.PUBLIC_STRAPI_URL ?? "http://localhost:1337";
