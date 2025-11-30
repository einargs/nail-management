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

const LoginError = z.object({
  status: z.number(),
  name: z.string(),
  message: z.string(),
});

const LoginRes = z.object({
  jwt: z.string(),
  user: z.object({
    //...docShared,
    id: z.number(),
    username: z.string(),
    email: z.string(),
  }),
});

// returns null if the error is a validation error.
//
// identifier can be the email or username for strapi.
//
// You can't login as a super admin account through the API?
// No, the super admin account isn't even a normal account.
export async function login(identifier: string, password: string): Promise<z.infer<typeof LoginRes> | null> {
  let res = await fetch(`${env.STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier, password 
    })
  });
  let body = await res.json();
  if (body.error) {
    try {
      let errorBody = LoginError.parse(body.error);
      if (errorBody.name === "ValidationError") {
        return null;
      }
      return Promise.reject(Error(`login endpoint error ${errorBody.name}: ${errorBody.message}`));
    } catch {
      throw Error("Unknown error response from login endpoint");
    }
  } else {
    try {
      let res = LoginRes.parse(body);
      return res;
    } catch {
      throw Error("Unknown login endpoint response");
    }
  }
}
/*
let res = await fetch("http://localhost:1337/api/auth/local/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "test",
    email: "test@test.com",
    password: "pass"
  })
});
console.log("REGISTER", await res.text());
*/

export const getHomePage = () => getSinglePage("home-page", HomePageData);
export const getServices = () => getSinglePage("services", z.array(Service));
