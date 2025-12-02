<script lang="ts">
  import type { StrapiImage } from "$lib/server/strapi";
  import * as common from "$lib/common";

  let {
    image,
    class: className,
    loading
  }: {
    image: StrapiImage,
    class: string
    loading?: string
  } = $props();

  // TODO: set up the breakpoints for the srcset and sizes stuff
  // and figure out how picture works with those.
  let format = image.formats.medium;
</script>

<img
  src={`${common.strapiURL}${format.url}`}
  loading={loading}
  alt={image.alternativeText}
  width={format.width}
  height={format.height}
  class={className}
/>
