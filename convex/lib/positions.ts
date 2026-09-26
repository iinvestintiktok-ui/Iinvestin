import type { Doc } from "../_generated/dataModel";
import { computeResult } from "./computeResult";

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export function estimateOpenPositionPercentage(
  investment: Doc<"investments">,
  now: number,
): number {
  if (investment.percentage !== null && investment.status !== "pending") {
    return investment.percentage;
  }

  if (investment.currentViews !== null && investment.currentViews !== undefined) {
    return computeResult(
      investment.viewsAtInvestment,
      investment.followersAtInvestment,
      investment.amountInvested,
      Math.max(1, investment.currentViews),
      investment.likesAtInvestment ?? 0,
      investment.currentLikes ?? 0,
    ).percentage;
  }

  const elapsed = Math.max(0, now - investment.timestamp);
  const progress = Math.min(1, elapsed / FORTY_EIGHT_HOURS_MS);

  if (investment.viewsAfter48h === null) {
    return 0;
  }

  const currentViews =
    investment.viewsAtInvestment +
    (investment.viewsAfter48h - investment.viewsAtInvestment) * progress;

  return computeResult(
    investment.viewsAtInvestment,
    investment.followersAtInvestment,
    investment.amountInvested,
    Math.max(1, currentViews),
    investment.likesAtInvestment ?? 0,
    investment.currentLikes ?? 0,
  ).percentage;
}

export function summarizeOpenPositions(
  investments: Doc<"investments">[],
  now: number,
) {
  const openPositions = investments.filter((bet) => bet.status === "pending");

  if (openPositions.length === 0) {
    return {
      count: 0,
      averagePercentage: null,
      totalStaked: 0,
    };
  }

  const percentages = openPositions.map((bet) => estimateOpenPositionPercentage(bet, now));
  const averagePercentage = Math.round(
    percentages.reduce((sum, percentage) => sum + percentage, 0) / percentages.length,
  );
  const totalStaked = openPositions.reduce((sum, bet) => sum + bet.amountInvested, 0);

  return {
    count: openPositions.length,
    averagePercentage,
    totalStaked,
  };
}
