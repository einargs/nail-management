<script lang="ts">
  import type { StrapiImage } from "$lib/server/strapi";

  let {
    image,
    class: className
  }: {
    image: StrapiImage,
    class: string
  } = $props();

  // TODO: set up the breakpoints for the srcset and sizes stuff
  // and figure out how picture works with those.
  let format = image.formats.medium;
</script>

<img
  src={`http://localhost:1337${format.url}`}
  alt={image.alternativeText}
  width={format.width}
  height={format.height}
  class={className}
/>
