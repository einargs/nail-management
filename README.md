# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Setting up VM
make a `/home/test/public/uploads` directory.

web-server.env
```
DATABASE_URL=postgresql://postgres@/mydb?host=/var/run/postgresql/

PORT=1080
STRAPI_TOKEN=
STRAPI_URL=http://0.0.0.0:1337
PUBLIC_STRAPI_URL=/strapi

SQUARE_APP_ID=
SQUARE_API_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
```

strapi-server.env
```
HOST=0.0.0.0
PORT=1337
STRAPI_PUBLIC_DIR="/home/test/public"

# Secrets
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
ENCRYPTION_KEY=

# Database
DATABASE_CLIENT=postgres
STRAPI_DATABASE_URL=postgres://postgres@/strapi?host=/var/run/postgresql/
JWT_SECRET=
```
