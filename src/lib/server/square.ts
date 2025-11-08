import { env } from "$env/dynamic/private";

import { SquareClient } from "square";

export const LOCATION_ID: string = env.SQUARE_LOCATION_ID;
export const square: SquareClient = new SquareClient({
  environment: "sandbox",
  // different for production
  baseUrl: "https://connect.squareupsandbox.com",
  token: env.SQUARE_API_ACCESS_TOKEN,
});
