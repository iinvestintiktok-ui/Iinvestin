import Navbar from './Navbar';

function Pulse({ className }: { className: string }) {
  return <div className={`rounded bg-white/5 animate-pulse ${className}`} />;
}

export function InvestmentCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex flex-row gap-4">
        <Pulse className="w-[88px] sm:w-[100px] aspect-[9/16] rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Pulse className="h-6 w-28" />
              <Pulse className="h-4 w-16" />
            </div>
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-4/5" />
          </div>
          <div className="space-y-2">
            <Pulse className="h-10 w-24 rounded-lg" />
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function InvestmentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <InvestmentCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function InvestorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Pulse className="h-5 w-40" />

        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Pulse className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />
            <div className="flex-1 w-full space-y-2">
              <Pulse className="h-8 w-48 max-w-full" />
              <Pulse className="h-4 w-36" />
              <Pulse className="h-4 w-44" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-5 rounded-xl bg-[#0a0a0c] space-y-3">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Pulse className="h-7 w-44 mb-4" />
          <InvestmentListSkeleton />
        </div>
      </div>
    </div>
  );
}

export function CreatorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Pulse className="h-5 w-32" />

        <div className="card overflow-hidden">
          <Pulse className="h-28 sm:h-32 rounded-none" />
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-14">
              <Pulse className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0" />
              <div className="flex-1 w-full space-y-2 sm:pb-2">
                <Pulse className="h-8 w-52 max-w-full" />
                <Pulse className="h-4 w-full max-w-md" />
                <Pulse className="h-4 w-36" />
                <Pulse className="h-4 w-28" />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-5 rounded-xl bg-[#0a0a0c] space-y-3">
                  <Pulse className="h-3 w-24" />
                  <Pulse className="h-8 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Pulse className="h-7 w-28 mb-4" />
          <InvestmentListSkeleton />
        </div>
      </div>
    </div>
  );
}
