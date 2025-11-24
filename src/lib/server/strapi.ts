import { env } from "$env/dynamic/private";
import { z } from "zod";
import { strapi } from '@strapi/client';

// NOTE: apparently when you add a new field it ends up as
// null.

const docShared = {
  documentId: z.string(),
  createdAt: z.iso.datetime(),
  publishedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};

const imageShared = {
  name: z.string(),
  mime: z.string(),
  ext: z.string(),
  // an absolute path
  url: z.string(),
  hash: z.string(),
  // can be decimal
  size: z.number(),
  width: z.number(),
  height: z.number(),
};

const ImageFormat = z.object({
  ...imageShared,
  //path: null in all the examples I see
  //sizeInBytes: z.number()
});

export type ImageFormat = z.infer<typeof ImageFormat>;

const Image = z.object({
  ...docShared,
  ...imageShared,
  alternativeText: z.string().nullable(),
  caption: z.string().nullable(),
  previewUrl: z.string().nullable(),
  // provider
  // provider_metadata
  formats: z.object({
    large: ImageFormat,
    small: ImageFormat,
    medium: ImageFormat,
    thumbnail: ImageFormat,
  }),
});

export type StrapiImage = z.infer<typeof Image>;

const HomePageData = z.object({
  ...docShared,
  // markdown
  introduction: z.string(),
  // markdown
  body: z.string(),
  // if this is null, populate failed.
  // or it was never initialized.
  // https://docs.strapi.io/cms/api/rest/populate-select
  // https://docs.strapi.io/cms/api/rest/guides/understanding-populate
  gallery: z.preprocess((val) => val === null ? [] : val, z.array(Image)),
  splash: Image,
  logo: Image,
});

export type HomePageData = z.infer<typeof HomePageData>;

const Service = z.object({
  title: z.string(),
  description: z.string(),
  cost: z.number().nullable(),
  definedPrice: z.boolean(),
  image: Image.nullable(),
});

// If we initialize it outside, it gets initialized during the build,
// and throws an error because bad auth.
const client = () => strapi({
  baseURL: `${env.STRAPI_URL}/api`,
  // Okay, for some reason the full access token doesn't work
  // but this read only token does??
  auth: env.STRAPI_READ_TOKEN,
});

async function getSinglePage<T extends z.ZodTypeAny>(endpoint: string, parser: T): Promise<z.infer<T>> {
  let body;
  try {
    // we have to include ?populate=* to get all media fields one level down.
    body = await client().single(endpoint).find({ populate: "*" });
  } catch (err) {
    throw Error(`error with request to strapi endpoint ${endpoint}: ${err}`);
  }
  try {
    return parser.parse(body.data);
  } catch (error) {
    //console.error("strapi parse error", error, "response", body.data);
    throw Error(`failed to parse strapi ${endpoint} response: ${error}.`);
  }
}

export const getHomePage = () => getSinglePage("home-page", HomePageData);
export const getServices = () => getSinglePage("services", z.array(Service));
