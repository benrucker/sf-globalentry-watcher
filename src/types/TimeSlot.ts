import { Boolean, Number, Record, Static, String } from "runtypes";

export const TimeSlot = Record({
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

export type TimeSlot = Static<typeof TimeSlot>;
