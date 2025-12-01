
BEFORE DEPLOY:
- automatic restarts via systemctl

Next is I think getting a look at amber's excel stuff to see what she's actually
using?
- She isn't checking the supplies every day.

You need Square Appointments Plus to cancel bookings programatically
or send confirmations using square.


Cool platform for error logging? https://docs.sentry.io/platforms/javascript/guides/svelte/
I think I'd rather just use logs.


Tool for moving strapi data: https://docs.strapi.io/cms/data-management/transfer

Strapi CORS
- need to setup for the hosted thing

Tables
- clients
  - their address
  - billing details
  - I think we can still use the square customer stuff
- appointments
  - client


Features
- reminders
  - twilio
  - the bullmq
- editing
  - headless CMS
    - let's go with strapi
