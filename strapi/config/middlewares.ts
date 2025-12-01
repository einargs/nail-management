export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: [
        // Your SvelteKit dev server
        'http://localhost:5173',
        'http://localhost:80',
        'http://localhost:8080',
        'http://localhost:8180',
        'https://localhost:8433',
      ], 
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
