<script lang="ts">
	import type { PageProps } from './$types';
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import StrapiImage from "$lib/components/strapi-image.svelte";
  import PublicHeader from "$lib/components/public-header.svelte";

  let debugSelect = false;
  let toRemove: string[] = $state([]);
  function select(name: string) {
    return () => toRemove.push(name);
  }

  let { data }: PageProps = $props();
  let { galleryData } = data;
</script>

<PublicHeader />
<section
  class="w-full m-10 flex flex-col items-center my-10 mx-5 m-10"
>
  {#if debugSelect}
    <pre>{Array.from(new Set(toRemove)).join("\n")}</pre>
  {/if}
  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 m-10">
    {#each galleryData.images as image}
      <div class="p-1 flex-col flex items-center justify-center align-center h-[100%]">
        <StrapiImage
          image={image}
          loading="lazy"
          class="shadow-md"
        />
        {#if debugSelect}
          <Button onclick={select(image)}>{image}</Button>
        {/if}
      </div>
    {/each}
  </div>
  <!-- TODO: setup squared -->
  <!-- availability, contact information, region worked in -->
</section>
