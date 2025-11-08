import { STRAPI_TOKEN, STRAPI_URL } from "$env/static/private";
import { env } from "$env/dynamic/private";
import { z } from "zod";

const homePageRes = z.object({
  data: z.object({
    introduction: z.string()
  }),
});

export type HomePageData = z.infer<typeof homePageRes>["data"];

export async function getHomePage(): Promise<HomePageData> {
  const res = await fetch(`${env.STRAPI_URL}/api/home-page`, {
    headers: {
      'Authorization': env.STRAPI_TOKEN
    }
  });
  const data = await res.json();
  try {
    return homePageRes.parse(data).data;
  } catch {
    throw Error(`Bad strapi response ${JSON.stringify(data)}`);
  }
}
