export type InvestmentStatus = "gain" | "loss" | "neutral" | "pending";

export interface ComputedResult {
  multiplier: number;
  percentage: number;
  valueAfter: number;
  status: Exclude<InvestmentStatus, "pending">;
}

export function computeResult(
  viewsAtInvestment: number,
  followersAtInvestment: number,
  amount: number,
  viewsAfter: number,
  likesAtInvestment = 0,
  likesAfter = 0,
): ComputedResult {
  const followerFactor = Math.max(1, Math.log10(followersAtInvestment + 10) / 4);

  if (amount === 0) {
    const safeViewsAt = Math.max(1, viewsAtInvestment);
    const viewGrowth = (viewsAfter - viewsAtInvestment) / safeViewsAt;

    let likeGrowth = viewGrowth;
    if (likesAtInvestment > 0 && likesAfter > 0) {
      likeGrowth = (likesAfter - likesAtInvestment) / likesAtInvestment;
    }

    const blendedGrowth = viewGrowth * 0.7 + likeGrowth * 0.3;
    const percentage = Math.round((blendedGrowth / followerFactor) * 100);
    const valueAfter = percentage;
    const multiplier = 1 + percentage / 100;

    let status: ComputedResult["status"];
    if (percentage > 5) status = "gain";
    else if (percentage < -5) status = "loss";
    else status = "neutral";

    return { multiplier, percentage, valueAfter, status };
  }

  const viewGrowthRatio = viewsAfter / Math.max(1, viewsAtInvestment);
  const rawMultiplier = viewGrowthRatio / followerFactor;
  const multiplier = Math.max(0, Math.round(rawMultiplier * 10) / 10);
  const valueAfter = Math.round(amount * multiplier);
  const percentage = Math.round((multiplier - 1) * 100);

  let status: ComputedResult["status"];
  if (percentage > 5) status = "gain";
  else if (percentage < -5) status = "loss";
  else status = "neutral";

  return { multiplier, percentage, valueAfter, status };
}
