<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import type {LayoutProps} from "./$types";
  import { Toaster } from 'svelte-sonner';
  let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Toaster />
{@render children?.()}
