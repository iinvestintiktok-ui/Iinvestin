import type { Doc, Id } from "../_generated/dataModel";
import { mapInvestor } from "./mappers";

export type LeaderboardPeriod = "day" | "week" | "all";

export interface LeaderboardEntry {
  investor: ReturnType<typeof mapInvestor>;
  totalProfit: number;
  winningBets: number;
  losingBets: number;
  totalBets: number;
  maxPercentage: number;
}

interface InvestmentRow {
  investorId: Id<"investors">;
  status: Doc<"investments">["status"];
  timestamp: number;
  valueAfter48h: number | null;
  amountInvested: number;
  percentage: number | null;
}

export function buildLeaderboard(
  investors: Doc<"investors">[],
  investments: InvestmentRow[],
  period: LeaderboardPeriod,
  now: number,
): LeaderboardEntry[] {
  const cutoff = new Date(now);
  if (period === "day") cutoff.setDate(cutoff.getDate() - 1);
  else if (period === "week") cutoff.setDate(cutoff.getDate() - 7);
  const cutoffMs = cutoff.getTime();

  const entries = investors.map((investor) => {
    let bets = investments.filter(
      (bet) => bet.investorId === investor._id && bet.status !== "pending",
    );
    if (period !== "all") {
      bets = bets.filter((bet) => bet.timestamp >= cutoffMs);
    }

    const totalProfit = bets.reduce(
      (sum, bet) => sum + ((bet.valueAfter48h ?? 0) - bet.amountInvested),
      0,
    );
    const winningBets = bets.filter((bet) => bet.status === "gain").length;
    const losingBets = bets.filter((bet) => bet.status === "loss").length;
    const maxPercentage = bets.reduce(
      (max, bet) => Math.max(max, bet.percentage ?? 0),
      0,
    );

    return {
      investor: mapInvestor(investor),
      totalProfit,
      winningBets,
      losingBets,
      totalBets: bets.length,
      maxPercentage,
    };
  });

  entries.sort((a, b) => b.totalProfit - a.totalProfit);
  return entries;
}

export function getInvestorRank(
  investors: Doc<"investors">[],
  investments: InvestmentRow[],
  investorId: Id<"investors">,
): number {
  const leaderboard = buildLeaderboard(investors, investments, "all", Date.now());
  const index = leaderboard.findIndex((entry) => {
    const investor = investors.find((inv) => inv.slug === entry.investor.id);
    return investor?._id === investorId;
  });
  return index === -1 ? 0 : index + 1;
}
