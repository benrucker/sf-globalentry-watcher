import "dotenv/config";
import fetch, { Headers } from "node-fetch";
import { readFile, writeFile } from "fs/promises";
import { TimeSlot } from "./types/TimeSlot.js";
import { TimeSlotsResponse } from "./types/TimeSlotsResponse.js";

const SFO_API_URL =
  "https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=5446";

const RESULT_FILENAME = "lastResult";

const EMPTY_RESULTS_STRING = "{}";

export async function main() {
  const timeSlots = await fetchTimeSlots();
  const haveResultsChanged = await compareResults(timeSlots);
  if (haveResultsChanged) {
    await sendDiscordMessage(buildWebhookRequestBody(timeSlots));
  } else {
    console.log("No change since last run");
  }
}

async function fetchTimeSlots() {
  const request = await fetch(SFO_API_URL);
  const response = await request.json();
  return TimeSlotsResponse.check(response);
}

async function compareResults(newTimeSlots: TimeSlotsResponse) {
  const firstTimeSlot = newTimeSlots.availableSlots[0];
  const newResult =
    firstTimeSlot != null
      ? JSON.stringify(firstTimeSlot)
      : EMPTY_RESULTS_STRING;

  await touchResultsFile();

  const lastResult = (await readFile(RESULT_FILENAME)).toString();
  console.log("last", lastResult);
  console.log("new", newResult);
  if (newResult !== lastResult) {
    await writeFile(RESULT_FILENAME, newResult);
    return true;
  }
  return false;
}

async function touchResultsFile() {
  try {
    await writeFile(RESULT_FILENAME, EMPTY_RESULTS_STRING, { flag: "wx" });
  } catch (error) {}
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
