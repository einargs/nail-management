<script lang="ts">
  import Markdown from "svelte-exmarkdown";
  let { md }: {md:string} = $props();
  // maybe replace this with rendering the markdown on the server
</script>


<div class="markdown-parent">
  <Markdown {md} />
</div>
