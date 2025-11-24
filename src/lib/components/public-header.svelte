<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import * as common from "$lib/common.js";
</script>

{#snippet PageLink(text : string, url : string)}

    <NavigationMenu.Item>
      <NavigationMenu.Link class="text-lg font-medium hover:bg-accent">
      <a href={url}>{text}</a>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
{/snippet}

<NavigationMenu.Root class="p-5 shadow-md w-full max-w-full flex flex-row justify-start bg-primary text-primary-foreground">
  <NavigationMenu.List class="items-center group flex flex-row justify-start gap-2">
  {@render PageLink("About", "/")}
  {@render PageLink("Services", "/#services")}
  {@render PageLink("Book Now", common.squareUpURL)}
  {@render PageLink("Gallery", "/gallery")}
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
