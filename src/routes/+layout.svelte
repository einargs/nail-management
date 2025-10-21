<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import type {LayoutProps} from "./$types";
  import { Toaster } from 'svelte-sonner';

  let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#snippet PageLink(text : string, url : string)}

    <NavigationMenu.Item>
      <NavigationMenu.Link class="text-lg font-medium hover:bg-accent">
      <a href={url}>{text}</a>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
{/snippet}

<NavigationMenu.Root class="p-5 shadow-md w-full max-w-full flex flex-row justify-start bg-primary text-primary-foreground">
  <NavigationMenu.List class="items-start group flex flex-row justify-start gap-2">
  {@render PageLink("Main", "/")}
  {#if data.user}
    <NavigationMenu.Item>
      <NavigationMenu.Link class="text-lg font-medium hover:bg-accent">
      <form method="POST" action="/login?/logout">
        <button>Logout</button>
      </form>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  {:else}
    {@render PageLink("Login", "/login")}
  {/if}
  <div class="text-lg font-medium">{data.user?.username ?? "no user"}</div>
  <!-- 
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Item One</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link>Link</NavigationMenu.Link>
      </NavigationMenu.Content> 
    </NavigationMenu.Item>
    <Skeleton class="size-12 rounded-full" />
-->
  </NavigationMenu.List>
</NavigationMenu.Root>

<Toaster />
<div class="flex flex-col items-center w-screen">
  {@render children?.()}
</div>
