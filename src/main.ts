import "dotenv/config";
import fetch, { Headers } from "node-fetch";
import { TimeSlot } from "./types/TimeSlot.js";
import { TimeSlotsResponse } from "./types/TimeSlotsResponse.js";

const SFO_API_URL =
  "https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=5446";

export async function main() {
  const timeSlots = await fetchTimeSlots();
  await sendDiscordMessage(buildWebhookRequestBody(timeSlots));
}

async function fetchTimeSlots() {
  const request = await fetch(SFO_API_URL);
  const response = await request.json();
  return TimeSlotsResponse.check(response);
}

async function sendDiscordMessage(content: string) {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (webhookUrl == null) {
    return;
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const response = await fetch(webhookUrl, {
    method: "POST",
    body: content,
    headers,
  });
  const outputStream = response.ok ? console.log : console.error;
  outputStream(response.status, response.statusText, response.body?.read());
}

function buildWebhookRequestBody(timeSlots: TimeSlotsResponse) {
  const nextTimeSlot = timeSlots.availableSlots[0];

  const content =
    nextTimeSlot == null
      ? "No time slot available"
      : `Next slot: ${getprettyTimeSlotRepresentation(nextTimeSlot)}`;

  return JSON.stringify({
    content,
  });
}

function getprettyTimeSlotRepresentation(timeSlot: TimeSlot) {
  const start = new Date(timeSlot.startTimestamp);
  return `${start.toLocaleDateString()} at ${start.toLocaleTimeString()}`;
}
