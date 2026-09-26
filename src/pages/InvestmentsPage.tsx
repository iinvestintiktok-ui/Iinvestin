import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import InvestmentCard from '../components/InvestmentCard';

export default function InvestmentsPage() {
  const investments = useQuery(api.investments.list, {});

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Latest investments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            All recent bets on the KWAÏ platform
          </p>
        </div>

        <div className="space-y-3">
          {investments === undefined ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="card h-36 animate-pulse bg-[#131316]" />
            ))
          ) : investments.length > 0 ? (
            investments.map((inv) => (
              <InvestmentCard key={inv.id} investment={inv} />
            ))
          ) : (
            <div className="card p-6 text-center text-sm text-gray-500">
              No investments yet. Run <code className="text-gray-300">pnpm convex:mockape-in</code> to load demo data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
