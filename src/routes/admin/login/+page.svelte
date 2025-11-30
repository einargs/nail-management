<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    type SuperValidated,
    type Infer, superForm
  } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import type { ActionData } from './$types';
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { loginSchema } from "./formSchema";

  let { data }: {
    data: {
      loginForm: SuperValidated<Infer<typeof loginSchema>>
    }
  } = $props();
  const loginForm = superForm(data.loginForm, {
    validators: zod4Client(loginSchema),
  });
  const { form: loginFormData, enhance: loginEnhance } = loginForm;
</script>

<section class="flex-col gap-4">
  <h1>Login</h1>
  <form method="post" action="?/login" use:loginEnhance class="flex-col">
    <Form.Field form={loginForm} name="username">
      <Form.Control>
        {#snippet children({props})}
          <Form.Label>Username</Form.Label>
          <Input {...props} required bind:value={$loginFormData.username} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field form={loginForm} name="password">
      <Form.Control>
        {#snippet children({props})}
          <Form.Label>Password</Form.Label>
          <Input {...props} required type="password" bind:value={$loginFormData.password} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <!--
    <label>
      Username
      <input
        name="username"
        class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </label>
    <label>
      Password
      <input
        type="password"
        name="password"
        class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </label>
    -->
    <Form.Button
      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >Login</Form.Button
    >
  </form>
</section>
