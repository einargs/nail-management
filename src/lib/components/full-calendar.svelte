<script lang="ts">
	import { onMount } from 'svelte';
  import { Calendar, type CalendarOptions } from "@fullcalendar/core";
  export { Calendar, type CalendarOptions } from "@fullcalendar/core";
  
	let classes: string;
	export { classes as class };

  export let options: CalendarOptions;

  let calendarEl: HTMLElement;
  let calendar: Calendar | null = null;


  // NOTE: I'm not implementing the update options stuff
  // https://github.com/YogliB/svelte-fullcalendar/blob/main/packages/svelte-fullcalendar/src/FullCalendar.svelte

  function initCalendar() {
    if (!calendarEl) throw Error("no element to initiate calendar inside");
    calendar = new Calendar(calendarEl, options);
    calendar.render();
  }

  onMount(() => {
    initCalendar();
    return () => {
      if (calendar) calendar.destroy();
    };
  });
</script>


<div bind:this={calendarEl} class={classes}></div>
