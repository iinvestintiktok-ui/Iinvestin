import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "poll tracked tiktok video views",
  { hours: 8 },
  internal.viewTrackingActions.startPollingWave,
);

export default crons;
