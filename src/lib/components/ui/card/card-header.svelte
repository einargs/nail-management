<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

    <!-- So header for some reason has container-type: inline-size applied to
      it, which decouples it's size from it's children, even when it's explicitly a block.

      This is for @container css rules that I don't even faintly understand.

      Use container-type-normal to override this.
      -->
<div
	bind:this={ref}
	data-slot="card-header"
	class={cn(
		"@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
