<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import type {LayoutProps} from "./$types";
  import * as common from "$lib/common";

  let { children, data }: LayoutProps = $props();
</script>

{#snippet PageLink(text : string, url : string)}

    <NavigationMenu.Item>
      <NavigationMenu.Link class="text-lg font-medium hover:bg-accent">
      <a href={url}>{text}</a>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
{/snippet}

<NavigationMenu.Root class="p-5 shadow-md w-full max-w-full flex flex-row justify-start bg-primary text-primary-foreground">
  <NavigationMenu.List class="items-start group flex flex-row justify-start gap-2 items-center">
    {@render PageLink("Main", "/")}
    {@render PageLink("Admin", "/admin")}
    {@render PageLink("Edit Website", common.strapiURL)}
    {@render PageLink("Calendar", "/admin/calendar")}
    {#if data.user}
      <NavigationMenu.Item>
        <NavigationMenu.Link class="text-lg font-medium hover:bg-accent">
        <form method="POST" action="/admin/login?/logout">
          <button>Logout</button>
        </form>
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    {:else}
      {@render PageLink("Login", "/admin/login")}
    {/if}
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
  <div class="grow-1"></div>
  <div class="flex-row flex gap-2 items-center">
    <span class="block icon-[material-symbols--person] text-4xl"></span>
    <div class="text-lg font-medium">{data.user?.username ?? "no user"}</div>
  </div>
</NavigationMenu.Root>

<div class="flex flex-col items-center w-screen">
  {@render children?.()}
</div>
