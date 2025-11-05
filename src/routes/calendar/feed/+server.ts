import { json, error } from '@sveltejs/kit';

import type { RequestHandler } from "./$types";
import { square } from "$lib/server/square";
import { type Square } from "square";

// Square only lets us search for bookings in a 31 day window.
// So this does multiple requests if the window is too large.
async function getListingsBetween(start: Date, end: Date): Promise<{booking: Square.Booking, customer: Square.Customer}[]> {
  let startMS = start.getTime();
  let endMS = end.getTime();
  console.log(new Date(startMS), new Date(endMS));
  let chunkSize = 15 * 24 * 60 * 60 * 1000;
  let ranges: {start:Date, end:Date}[] = [];
  let windowStart = startMS;
  let windowEnd = startMS + chunkSize;

  while (windowEnd < endMS) {
    ranges.push({start: new Date(windowStart), end: new Date(windowEnd)});
    windowStart = windowEnd;
    windowEnd += chunkSize;
  }
  ranges.push({start: new Date(windowStart), end: new Date(endMS)});
  console.log("SCREAMINGDGGSDGS");
  console.log(ranges);


  let bookingsPages = await Promise.all(ranges.map(({start, end}) => square.bookings.list({
    startAtMax: end.toISOString(),
    startAtMin: start.toISOString()
  })));
  let bookings = bookingsPages.flatMap(page => page.data);
  let customerMap: Map<string, Promise<Square.Customer>> = new Map();
  return Promise.all(bookings.map(async booking => {
    if (!booking.customerId) throw Error(`booking ${booking.id} has no customer id`);
    let customerPromise = customerMap.get(booking.customerId);
    if (!customerPromise) {
      customerPromise = square.customers.get({customerId:booking.customerId}).then(res => {
        if (!res.customer) throw Error(`error getting customer ${booking.customerId}: ${res.errors}`);
        return res.customer;
      });
      customerMap.set(booking.customerId, customerPromise);
    }
    let customer = await customerPromise;

    return {
      booking,
      customer
    };
  }));
}

export const GET: RequestHandler = async ({url, request}) => {
  // RFC 3339 is a slightly tightened up version of ISO8601
  let start = url.searchParams.get("start");
  let end = url.searchParams.get("end");
  if (!start || !end) {
    console.error("");
    error(400, "bad request");
  }
  console.log("GET", new Date(start));
  let bookings = await getListingsBetween(new Date(start), new Date(end));
  return json(bookings.map(({booking, customer}) => {
    if (!booking.startAt) {
      console.error("no start time for booking", booking.id);
      return null;
    }

    if (!booking?.appointmentSegments?.length) {
      console.error("multiple appointment segments for booking", booking.id);
      return null;
    }
    // minutes
    let appointmentLength = booking.appointmentSegments.map(seg => {
      if (!seg.durationMinutes) {
        throw Error(`appointment segment for booking ${booking.id} has no duration`);
      }
      return seg.durationMinutes;
    }).reduce((a,b) => a+b);
    let bookingStart: number = Date.parse(booking.startAt);
    let bookingEnd = new Date(bookingStart + appointmentLength * 60 * 1000);

    return {
      id: booking.id,
      title: customer.nickname || `${customer.givenName} ${customer.familyName}`,
      start: booking.startAt,
      end: bookingEnd.toISOString()
    };
  }).filter(eventObj => eventObj !== null));
}
