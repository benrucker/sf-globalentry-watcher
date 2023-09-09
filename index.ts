import { Array, Boolean, Number, Record, String, Static } from "runtypes";
import fetch, { Headers } from "node-fetch";

/** Example response
 {
  "availableSlots" : [ {
    "locationId" : 5446,
    "startTimestamp" : "2023-12-27T18:15",
    "endTimestamp" : "2023-12-27T18:30",
    "active" : true,
    "duration" : 15,
    "remoteInd" : false
  } ],
  "lastPublishedDate" : "2023-12-29T21:15:00"
} 
 */

const TimeSlot = Record({
  /** The ID of the location. Ex: SFO is 5446 */
  locationId: Number,

  /** The beginning of the interview slot. */
  startTimestamp: String,
  /** The end of the interview slot. */
  endTimestamp: String,
  /** Duration in minutes of the interview slot */
  duration: Number,

  /** ??? */
  active: Boolean,
  /** ??? */
  remoteInd: Boolean,
});

type TimeSlot = Static<typeof TimeSlot>;

const TimeSlotsResponse = Record({
  availableSlots: Array(TimeSlot),
  /** Time of the last available interview slot. */
  lastPublishedDate: String,
});

type TimeSlotsResponse = Static<typeof TimeSlotsResponse>;

async function fetchTimeSlots() {
  const request = await fetch(
    "https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=5446"
  );

  const response = await request.json();

  return TimeSlotsResponse.check(response);
}

async function sendDiscordMessage(content: string) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const response = await fetch(
    "https://discord.com/api/webhooks/1150164711464247326/uWyVFOXzyl9LM9bvonkZnhJY3uV_CdVsOhdYKkkBq0oQyRylrjIuTNxgxxCJcnJmBzeT",
    { method: "POST", body: content, headers }
  );
  const outputStream = response.ok ? console.log : console.error;
  outputStream(response.status, response.statusText, response.body.read());
}

function buildWebhookRequestBody(timeSlots: TimeSlotsResponse) {
  const content = `Next slot: ${getprettyTimeSlotRepresentation(
    timeSlots.availableSlots[0]
  )}`;

  return JSON.stringify({
    content,
  });
}

function getprettyTimeSlotRepresentation(timeSlot: TimeSlot) {
  const start = new Date(timeSlot.startTimestamp);
  return `${start.toLocaleDateString()} at ${start.toLocaleTimeString()}`;
}

const timeSlots = await fetchTimeSlots();
await sendDiscordMessage(buildWebhookRequestBody(timeSlots));
