/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as creators from "../creators.js";
import type * as crons from "../crons.js";
import type * as investmentActions from "../investmentActions.js";
import type * as investments from "../investments.js";
import type * as investors from "../investors.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lib_authHelpers from "../lib/authHelpers.js";
import type * as lib_computeResult from "../lib/computeResult.js";
import type * as lib_leaderboard from "../lib/leaderboard.js";
import type * as lib_mappers from "../lib/mappers.js";
import type * as lib_mockSeedData from "../lib/mockSeedData.js";
import type * as lib_passwordWeb from "../lib/passwordWeb.js";
import type * as lib_positions from "../lib/positions.js";
import type * as lib_tiktokProfile from "../lib/tiktokProfile.js";
import type * as lib_tiktokVideo from "../lib/tiktokVideo.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_viewTrackingHelpers from "../lib/viewTrackingHelpers.js";
import type * as mockape from "../mockape.js";
import type * as platform from "../platform.js";
import type * as seedChartSnapshots from "../seedChartSnapshots.js";
import type * as tiktokActions from "../tiktokActions.js";
import type * as viewPollingTest from "../viewPollingTest.js";
import type * as viewTracking from "../viewTracking.js";
import type * as viewTrackingActions from "../viewTrackingActions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  creators: typeof creators;
  crons: typeof crons;
  investmentActions: typeof investmentActions;
  investments: typeof investments;
  investors: typeof investors;
  leaderboard: typeof leaderboard;
  "lib/authHelpers": typeof lib_authHelpers;
  "lib/computeResult": typeof lib_computeResult;
  "lib/leaderboard": typeof lib_leaderboard;
  "lib/mappers": typeof lib_mappers;
  "lib/mockSeedData": typeof lib_mockSeedData;
  "lib/passwordWeb": typeof lib_passwordWeb;
  "lib/positions": typeof lib_positions;
  "lib/tiktokProfile": typeof lib_tiktokProfile;
  "lib/tiktokVideo": typeof lib_tiktokVideo;
  "lib/validators": typeof lib_validators;
  "lib/viewTrackingHelpers": typeof lib_viewTrackingHelpers;
  mockape: typeof mockape;
  platform: typeof platform;
  seedChartSnapshots: typeof seedChartSnapshots;
  tiktokActions: typeof tiktokActions;
  viewPollingTest: typeof viewPollingTest;
  viewTracking: typeof viewTracking;
  viewTrackingActions: typeof viewTrackingActions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
