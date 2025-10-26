<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { addItemSchema, updateItemSchema } from "./formSchema";
  import { toast } from 'svelte-sonner';
  import {
    type SuperValidated,
    type Infer, superForm
  } from "sveltekit-superforms";
  import SuperDebug from "sveltekit-superforms";
  import {zodClient } from "sveltekit-superforms/adapters";
  import { type Item } from "$lib/server/db/schema";

  let { form: dataForm, items }: {
    form: SuperValidated<Infer<typeof addItemSchema>>,
    updateItemForm: SuperValidated<Infer<typeof updateItemSchema>>,
    items: Item[]
  } = $props();
  const form = superForm(dataForm, {
    validators: zodClient(addItemSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success(`You submitted ${JSON.stringify(form.data, null, 2)}`);
      } else {
        toast.error("Please fix the errors in the form.");
      }
    }
  });
  const { form: formData, enhance } = form;

  let editFormOpen = $state(false);
  let editingItemIndex = $state(0);

  const editForm = superForm({} as SuperValidated<Infer<typeof updateItemSchema>>, {
    validators: zodClient(updateItemSchema),
    onSubmit({formData}) {
      console.log("submitting edit form", formData);
    },
    onUpdated({form}) {
      if (form.valid) {
        console.log("update", form);
        editFormOpen = false;
      } else {
        toast.error("There is a problem with the chanages to the item.");
      }
      //Object.assign(items[editingItemIndex], form.data);
    },
  });
  const {
    form: editDataForm,
    enhance: editEnhance,
    errors: editErrors,
    formId: editFormId
  } = editForm;

  function initEditForm(item: Item, index: number, open: boolean) {
    console.log("openend", item, open);
    if (open) {
      editingItemIndex = index;
      $editFormId = ""+item.id;
      $editDataForm.id = item.id;
      $editDataForm.name = item.name;
      $editDataForm.cost = item.cost;
      $editDataForm.quantity = item.quantity;
      $editDataForm.reorderThreshold = item.reorderThreshold;
      console.log("initEditForm data", $editDataForm);
    }
  }

  let dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  let costFormat = (cost: number) => dollarFormatter.format(cost/100);
</script>

<!--
{#snippet ItemFormFields(formArg: typeof editForm, data: typeof editDataForm)}
  <Form.Field form={formArg} name="name">
    <Form.Control>
      {#snippet children({props})}
        <Form.Label>Item Name</Form.Label>
        <Input {...props} bind:value={$data.name} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field form={formArg} name="cost">
    <Form.Control>
      {#snippet children({props})}
        <Form.Label>Item Cost</Form.Label>
        <Input {...props} required type="number" bind:value={$formData.cost} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field form={formArg} name="quantity">
    <Form.Control>
      {#snippet children({props})}
        <Form.Label>Item Quantity</Form.Label>
        <Input {...props} required type="number" bind:value={$formData.quantity} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field form={formArg} name="reorderThreshold">
    <Form.Control>
      {#snippet children({props})}
        <Form.Label>Reorder Threshold</Form.Label>
        <Input {...props} required type="number" bind:value={$formData.reorderThreshold} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{/snippet}
-->

{#snippet EditDialog(item: Item, index: number)}
  <Dialog.Root bind:open={editFormOpen} onOpenChange={(isOpen) => initEditForm(item, index, isOpen)}>
    <Dialog.Trigger class={buttonVariants({variant:"default"})}>Edit</Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Update the item</Dialog.Title>
        <!-- <Dialog.Description>Modify the item.</Dialog.Description> -->
      </Dialog.Header>
      <form class="grid gap-4 py-4" use:editEnhance method="POST" action="?/updateItem">
        <input type="hidden" name="id" bind:value={$editDataForm.id} />
        <Form.Field form={editForm} name="name">
          <Form.Control>
            {#snippet children({props})}
              <Form.Label>Item Name</Form.Label>
              <Input {...props} bind:value={$editDataForm.name} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field form={editForm} name="cost">
          <Form.Control>
            {#snippet children({props})}
              <Form.Label>Item Cost</Form.Label>
              <Input {...props} required type="number" bind:value={$editDataForm.cost} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field form={editForm} name="quantity">
          <Form.Control>
            {#snippet children({props})}
              <Form.Label>Item Quantity</Form.Label>
              <Input {...props} required type="number" bind:value={$editDataForm.quantity} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field form={editForm} name="reorderThreshold">
          <Form.Control>
            {#snippet children({props})}
              <Form.Label>Reorder Threshold</Form.Label>
              <Input {...props} required type="number" bind:value={$editDataForm.reorderThreshold} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Button>Save Changes</Form.Button>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{/snippet}

<div class="w-full flex flex-col items-center">
  <div class="w-[50vw]">
  <SuperDebug data={$editDataForm} />
  </div>
  <div>{JSON.stringify($editErrors)}</div>
  <!-- TODO: convert these into tables -->
  <section class="flex flex-col p-15 w-full gap-4">
    <h1 class="font-medium text-xl">Items</h1>
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px]">Item</Table.Head>
          <Table.Head>Cost</Table.Head>
          <Table.Head>Quantity</Table.Head>
          <Table.Head>Reorder Threshold</Table.Head>
          <Table.Head><!-- Empty so the highlighting looks right --></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each items as item, i (item.id)}
          <Table.Row>
            <Table.Cell class="font-medium">{item.name}</Table.Cell>
            <Table.Cell>{item.quantity}</Table.Cell>
            <Table.Cell>{costFormat(item.cost)}</Table.Cell>
            <Table.Cell>{item.reorderThreshold}</Table.Cell>
            <Table.Cell class="text-center">
              {@render EditDialog(item, i)}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </section>

  <section class="w-full px-10 flex flex-col items-center gap-4">
    <form method="post" action="?/addItem" use:enhance class="w-full md:w-md flex flex-col gap-4">
      <h1 class="font-medium text-xl">Add Item</h1>
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({props})}
            <Form.Label>Item Name</Form.Label>
            <Input {...props} bind:value={$formData.name} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="cost">
        <Form.Control>
          {#snippet children({props})}
            <Form.Label>Item Cost</Form.Label>
            <Input {...props} required type="number" bind:value={$formData.cost} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="quantity">
        <Form.Control>
          {#snippet children({props})}
            <Form.Label>Item Quantity</Form.Label>
            <Input {...props} required type="number" bind:value={$formData.quantity} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="reorderThreshold">
        <Form.Control>
          {#snippet children({props})}
            <Form.Label>Reorder Threshold</Form.Label>
            <Input {...props} required type="number" bind:value={$formData.reorderThreshold} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button>Add Item</Form.Button>
    </form>
  </section>
</div>
