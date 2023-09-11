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
  const firstTimeslot = timeSlots.availableSlots[0];

  const haveResultsChanged = await compareResults(firstTimeslot);
  if (haveResultsChanged) {
    await sendDiscordMessage(buildWebhookRequestBody(firstTimeslot));
  } else {
    console.log("No change since last run");
  }
}

async function fetchTimeSlots() {
  const repsonse = await fetch(SFO_API_URL);
  const data = await repsonse.json();
  return TimeSlotsResponse.check(data);
}

async function compareResults(timeSlot: TimeSlot | undefined) {
  await touchResultsFile();

  const newResult =
    timeSlot != null ? JSON.stringify(timeSlot) : EMPTY_RESULTS_STRING;
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
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("EEXIST")) {
      // No-op
    } else {
      console.error(error);
    }
  }
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

function buildWebhookRequestBody(timeSlot: TimeSlot | undefined) {
  const content =
    timeSlot == null
      ? "No time slot available"
      : `Next slot: ${formatTimestamp(timeSlot.startTimestamp)}`;

  return JSON.stringify({
    content,
  });
}

function formatTimestamp(timestamp: string) {
  const start = new Date(timestamp);
  return `${start.toDateString()} at ${start.toLocaleTimeString(undefined, {
    timeStyle: "short",
  })}`;
}
