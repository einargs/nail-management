<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { addClientSchema, type AddClientSchema } from "./formSchema";
  import { toast } from 'svelte-sonner';
  import {
    type SuperValidated,
    type Infer, superForm
  } from "sveltekit-superforms";
  import SuperDebug from "sveltekit-superforms";
  import {zod4Client } from "sveltekit-superforms/adapters";
  import { type Client } from "$lib/server/db/schema";


  let { form: dataForm, clients }: {
    form: SuperValidated<Infer<AddClientSchema>>,
    clients: Client[]
  } = $props();
  const form = superForm(dataForm, {
    validators: zod4Client(addClientSchema),
    onUpdate: ({ form }) => {
      if (form.valid) {
        toast.success(`You submitted ${JSON.stringify(form.data, null, 2)}`);
      } else {
        toast.error("Please fix the errors in the form.");
      }
    }
  });
  const { form: formData, enhance } = form;
</script>

<section class="flex-col p-15 w-full gap-4">
  {#each clients as client}
    <Card.Root>
      <Card.Header>
        <Card.Title>{client.name}</Card.Title>
        <Card.Description>{client.email} {client.phone}</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>Card Content</p>
      </Card.Content>
      <Card.Footer>
        <p>Card Footer</p>
      </Card.Footer>
    </Card.Root>
  {/each}
</section>


<section class="w-full px-10 flex flex-col items-center gap-4">
  <form method="post" action="?/addClient" use:enhance class="w-full md:w-md flex flex-col gap-4">
    <h1 class="font-medium text-xl">Add Client</h1>
    <Form.Field {form} name="name">
      <Form.Control>
        {#snippet children({props})}
          <Form.Label>Client Name</Form.Label>
          <Input {...props} bind:value={$formData.name} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="email">
      <Form.Control>
        {#snippet children({props})}
          <Form.Label>Client Email</Form.Label>
          <Input {...props} required type="email" bind:value={$formData.email} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="phone">
      <Form.Control>
        {#snippet children({props})}
          <Form.Label>Client Phone Number</Form.Label>
          <Input {...props} required type="tel" bind:value={$formData.phone} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Add Client</Form.Button>
  </form>
</section>
