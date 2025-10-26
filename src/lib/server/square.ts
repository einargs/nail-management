import { SQUARE_API_ACCESS_TOKEN, SQUARE_LOCATION_ID } from "$env/static/private";

import { SquareClient } from "square";

export const LOCATION_ID: string = SQUARE_LOCATION_ID;
export const square: SquareClient = new SquareClient({
  environment: "sandbox",
  // different for production
  baseUrl: "https://connect.squareupsandbox.com",
  token: SQUARE_API_ACCESS_TOKEN,
});
