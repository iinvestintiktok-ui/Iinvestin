import { useState } from 'react';
import { Rocket } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

export default function HowItWorksPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const steps = [
    {
      number: '01',
      title: 'Find a viral video',
      description: 'Spot a freshly posted TikTok video you think will blow up within the next 48 hours.',
    },
    {
      number: '02',
      title: 'Paste the link',
      description: 'Copy the TikTok video link into KWAÏ and choose how much virtual currency you want to invest.',
    },
    {
      number: '03',
      title: 'The system records it',
      description: 'KWAÏ instantly captures the creator\'s view count and follower count at the moment of your investment.',
    },
    {
      number: '04',
      title: 'Come back after 48h',
      description: 'After 48 hours, the system rechecks the views. Your payout depends on view growth relative to the creator\'s followers.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white text-balance">
            How it works
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto text-balance">
            Bet on TikTok videos that are about to go viral. The bigger the explosion with a small creator, the bigger your payout.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="card p-6 sm:p-8 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-2 font-display font-bold text-8xl text-white/[0.04] select-none leading-none">
                {step.number}
              </div>
              <div className="relative">
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-2">
              How the payout works
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your payout depends on view growth <span className="text-white font-medium">relative to the creator&apos;s follower count</span>. A video that blows up when the creator has few followers pays big. The same growth with a creator who is already huge pays little.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-emerald-500/5">
              <p className="text-sm font-semibold text-emerald-400 mb-4">Jackpot</p>
              <div className="space-y-3 text-sm">
                <div className="text-gray-300">
                  Creator with <span className="text-white font-bold">2,900</span> followers
                </div>
                <div className="text-gray-300">
                  Video: <span className="text-white font-bold">100</span> → <span className="text-white font-bold">200,000</span> views
                </div>
                <div className="pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-3xl text-emerald-400 tracking-tight">+2680%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Invested 1,000 KWAÏ → value 27,800 KWAÏ
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-500/5">
              <p className="text-sm font-semibold text-amber-400 mb-4">Low payout</p>
              <div className="space-y-3 text-sm">
                <div className="text-gray-300">
                  Creator with <span className="text-white font-bold">100,000</span> followers
                </div>
                <div className="text-gray-300">
                  Video: <span className="text-white font-bold">100</span> → <span className="text-white font-bold">200,000</span> views
                </div>
                <div className="pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-3xl text-amber-400 tracking-tight">-20%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Invested 1,000 KWAÏ → value 800 KWAÏ
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Same view growth, but the creator with fewer followers earns a payout 35x higher.
          </p>
        </div>

        <div className="card p-6 sm:p-8 text-center bg-gradient-to-r from-[#13131a] via-[#16121f] to-[#13131a]">
          <h3 className="font-display font-bold text-xl text-white mb-2">
            Sign in to get started
          </h3>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Create an account in seconds with Google, TikTok, or email. Once you&apos;re in, paste a TikTok link and place your first bet.
          </p>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Rocket className="w-4 h-4" />
            Sign in and invest
          </button>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
