<script lang="ts">
	import FullCalendar from '$lib/components/full-calendar.svelte';
	import daygridPlugin from '@fullcalendar/daygrid';
	import listPlugin from '@fullcalendar/list';
	import timegridPlugin from '@fullcalendar/timegrid';
  import { Calendar, type CalendarOptions } from "@fullcalendar/core";
  import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
	import type { PageProps } from './$types';

  let startTime: Date | undefined = $state(undefined);
  let endTime: Date | undefined = $state(undefined);

  // to make an appointment, we need:
  // - time
  // - address
  // - service
  // - client

  // for customer facing:
  // - https://developer.squareup.com/docs/checkout-api
  function makeAppointment(time: Date) {
    startTime = time;
  }

  let { data }: PageProps = $props();

	let options = {
    headerToolbar: { center: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },
		initialView: 'dayGridMonth',
    events: "/admin/calendar/feed",
		plugins: [daygridPlugin, timegridPlugin, listPlugin, interactionPlugin],
    dateClick(info: DateClickArg) {
      let view = info.view;
      let calendar = view.calendar;
      if (info.view.type == "dayGridMonth") {
        //calendar.select(info.dateStr);
        calendar.changeView("timeGridDay", info.dateStr);
      } else if (["timeGridWeek", "timeGridDay"].includes(info.view.type)) {
        makeAppointment(info.date);
      }
    },
	};
</script>

<div>{startTime}</div>
<div>{endTime}</div>

<FullCalendar {options} class="w-full"/>
