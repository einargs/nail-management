<script lang="ts">
	import type { PageProps } from './$types';
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
  import {zodClient } from "sveltekit-superforms/adapters";
  import ClientForm from "./client-form.svelte";
  import ItemForm from "./item-form.svelte";


  let { data }: PageProps = $props();
</script>


<h1>Dashboard</h1>


<ClientForm form={data.addClientForm} clients={data.clients} />
<ItemForm form={data.addItemForm} items={data.items} updateItemForm={data.updateItemForm} />

