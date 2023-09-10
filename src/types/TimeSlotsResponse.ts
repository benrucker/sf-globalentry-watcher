import { Array, Record, Static, String } from "runtypes";
import { TimeSlot } from "./TimeSlot.js";

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

export const TimeSlotsResponse = Record({
  availableSlots: Array(TimeSlot),
  /** Time of the last available interview slot. */
  lastPublishedDate: String,
});

export type TimeSlotsResponse = Static<typeof TimeSlotsResponse>;
