import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate, setError } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import * as schemas from "./formSchema";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    return redirect(302, '/admin');
  }
  const loginForm = await superValidate({
  }, zod4(schemas.loginSchema));
  return {loginForm};
};

export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return fail(401);
    }
    await auth.invalidateSession(event.locals.session.id);
    auth.deleteSessionTokenCookie(event);

    return redirect(302, '/admin/login');
  },
  login: async (event) => {
    console.log("login attempt");
    const form = await superValidate(event.request, zod4(schemas.loginSchema));
    if (!form.valid) return fail(400, { loginForm: form });

    try {
      let user = await auth.strapiLogin(
        event,
        form.data.username,
        form.data.password);
      if (user === null) {
        return message(form, 'Incorrect username or password', {
          status: 403
        });
      }
    } catch (error) {
      console.error(error);
      return message(form, 'A server error has occurred', {
        status: 500
      });
    }

    return redirect(302, '/admin');
  },
    /*
import { hash, verify } from '@node-rs/argon2';
  login: async (event) => {
    // TODO: to connect with the strapi just make something that
    // fetches like the user document or something unimportant?
    // Or write a custom plugin with an endpoint that confirms
    // the authentication token.
    const formData = await event.request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!validateUsername(username)) {
      return fail(400, {
        message:
          'Invalid username (min 3, max 31 characters, alphanumeric only)'
      });
    }
    if (!validatePassword(password)) {
      return fail(400, {
        message: 'Invalid password (min 6, max 255 characters)'
      });
    }

    const results = await db
      .select()
      .from(table.user)
      .where(eq(table.user.username, username));

    const existingUser = results.at(0);
    if (!existingUser) {
      return fail(400, { message: 'Incorrect username or password' });
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
    if (!validPassword) {
      return fail(400, { message: 'Incorrect username or password' });
    }


    return redirect(302, '/admin');
  },
  register: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    console.log(username, password);

    if (!validateUsername(username)) {
      return fail(400, { message: 'Invalid username' });
    }
    if (!validatePassword(password)) {
      return fail(400, { message: 'Invalid password' });
    }

    const userId = generateUserId();
    const passwordHash = await hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });

    try {
      await db
        .insert(table.user)
        .values({ id: userId, username, passwordHash });

      const sessionToken = auth.generateSessionToken();
      const session = await auth.createSession(sessionToken, userId);
      auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
    } catch (error) {
      console.error(error);
      return fail(500, { message: 'An error has occurred' });
    }
    return redirect(302, '/admin');
  }
  */
};

/*
function validateUsername(username: unknown): username is string {
  return (
    typeof username === 'string' &&
    username.length >= 3 &&
    username.length <= 31 &&
    /^[a-z0-9_-]+$/.test(username)
  );
}

function validatePassword(password: unknown): password is string {
  return (
    typeof password === 'string' &&
    password.length >= 6 &&
    password.length <= 255
  );
}
*/
