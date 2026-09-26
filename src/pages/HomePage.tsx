import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import SponsorBanner from '../components/SponsorBanner';
import KpiRow from '../components/KpiRow';
import LeaderboardWidget from '../components/LeaderboardWidget';
import InvestmentCard from '../components/InvestmentCard';
import SectionHeaderLink from '../components/SectionHeaderLink';

export default function HomePage() {
  const investments = useQuery(api.investments.list, {});

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <SponsorBanner />
        <KpiRow />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4" data-tour="latest-investments">
            <SectionHeaderLink to="/investments" className="font-display font-bold text-xl">
              Latest investments
            </SectionHeaderLink>
            <div className="space-y-3">
              {investments === undefined ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="card h-36 animate-pulse bg-[#131316]" />
                ))
              ) : investments.length > 0 ? (
                investments.slice(0, 10).map((inv) => (
                  <InvestmentCard key={inv.id} investment={inv} />
                ))
              ) : (
                <div className="card p-6 text-center text-sm text-gray-500">
                  No investments yet. Run <code className="text-gray-300">pnpm convex:mockape-in</code> to load demo data.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <LeaderboardWidget maxItems={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
