import { useCallback, useEffect, useId, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppUi } from '../context/AppUiContext';

type PanelPlacement = 'left' | 'right' | 'below' | 'above' | 'center';

interface TourStep {
  target: string;
  title: string;
  description: string;
  panelPlacement: PanelPlacement;
  openInvestModalOnEnter?: boolean;
  closeInvestModalOnEnter?: boolean;
  openInvestModalOnContinue?: boolean;
}

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 300;
const VIEWPORT_MARGIN = 16;
const PANEL_GAP = 16;
const SPOTLIGHT_PADDING = 10;

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="new-investment"]',
    title: 'Place your first bet',
    description:
      'Every investment starts here. Continue to open the form and bet on a TikTok video you think will go viral within 48 hours.',
    panelPlacement: 'below',
    openInvestModalOnContinue: true,
  },
  {
    target: '[data-tour="invest-link-input"]',
    title: 'Paste the TikTok link',
    description:
      'Drop the video URL here. KWAÏ loads a preview with current views, likes, and followers.',
    panelPlacement: 'left',
    openInvestModalOnEnter: true,
  },
  {
    target: '[data-tour="invest-preview"]',
    title: 'Check the preview',
    description:
      'Once the link is valid, you see the video preview below. Your position starts at 0% and moves with hourly view and like growth.',
    panelPlacement: 'left',
    openInvestModalOnEnter: true,
  },
  {
    target: '[data-tour="invest-confirm"]',
    title: 'Place your bet',
    description:
      'No stake to choose — just confirm. In this tutorial we only walk through the flow, no bet is placed.',
    panelPlacement: 'left',
    openInvestModalOnEnter: true,
  },
  {
    target: '[data-tour="latest-investments"]',
    title: 'See what others are betting on',
    description:
      'Once you invest, your bet shows up in this feed alongside everyone else\'s. Follow trending videos and spot opportunities early.',
    panelPlacement: 'right',
    closeInvestModalOnEnter: true,
  },
  {
    target: '[data-tour="my-positions"]',
    title: 'Follow your gains here',
    description:
      'My positions shows your open bets in one place. If you have several active investments, KWAÏ displays the average return across them.',
    panelPlacement: 'above',
  },
  {
    target: '[data-tour="leaderboard"]',
    title: 'Track the top investors',
    description:
      'The leaderboard ranks the best calls. Compare your gains, learn from top performers, and climb the ranks over time.',
    panelPlacement: 'left',
  },
];

function getPanelStyle(rect: DOMRect | null, placement: PanelPlacement): CSSProperties {
  if (!rect || placement === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const placements: PanelPlacement[] =
    placement === 'left'
      ? ['left', 'right', 'below', 'above', 'center']
      : placement === 'right'
        ? ['right', 'left', 'below', 'above', 'center']
        : placement === 'below'
          ? ['below', 'above', 'right', 'left', 'center']
          : ['above', 'below', 'right', 'left', 'center'];

  for (const candidate of placements) {
    if (candidate === 'center') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    let top = 0;
    let left = 0;

    switch (candidate) {
      case 'left':
        left = rect.left - PANEL_WIDTH - PANEL_GAP;
        top = rect.top + rect.height / 2 - PANEL_HEIGHT / 2;
        break;
      case 'right':
        left = rect.right + PANEL_GAP;
        top = rect.top + rect.height / 2 - PANEL_HEIGHT / 2;
        break;
      case 'below':
        left = rect.left + rect.width / 2 - PANEL_WIDTH / 2;
        top = rect.bottom + PANEL_GAP;
        break;
      case 'above':
        left = rect.left + rect.width / 2 - PANEL_WIDTH / 2;
        top = rect.top - PANEL_HEIGHT - PANEL_GAP;
        break;
    }

    const fitsHorizontally =
      left >= VIEWPORT_MARGIN && left + PANEL_WIDTH <= viewportWidth - VIEWPORT_MARGIN;
    const fitsVertically =
      top >= VIEWPORT_MARGIN && top + PANEL_HEIGHT <= viewportHeight - VIEWPORT_MARGIN;

    if (fitsHorizontally && fitsVertically) {
      return { top, left };
    }
  }

  return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
}

function SpotlightOverlay({
  rect,
  maskId,
}: {
  rect: DOMRect | null;
  maskId: string;
}) {
  if (!rect) {
    return (
      <svg className="fixed inset-0 h-full w-full pointer-events-none" aria-hidden="true">
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" />
      </svg>
    );
  }

  const x = rect.left - SPOTLIGHT_PADDING;
  const y = rect.top - SPOTLIGHT_PADDING;
  const width = rect.width + SPOTLIGHT_PADDING * 2;
  const height = rect.height + SPOTLIGHT_PADDING * 2;
  const radius = 12;

  return (
    <svg className="fixed inset-0 h-full w-full pointer-events-none" aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius} fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask={`url(#${maskId})`} />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill="none"
        stroke="rgb(129 140 248)"
        strokeWidth={2}
        className="animate-pulse"
      />
    </svg>
  );
}

function lockPageScroll() {
  const scrollY = window.scrollY;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  return scrollY;
}

function unlockPageScroll(scrollY: number) {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollY);
}

export default function OnboardingTour() {
  const { showTutorial, dismissTutorial } = useAuth();
  const { openInvestModal, closeInvestModal } = useAppUi();
  const navigate = useNavigate();
  const location = useLocation();
  const maskId = useId().replace(/:/g, '');
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  const currentStep = TOUR_STEPS[step];
  const isLastStep = step === TOUR_STEPS.length - 1;

  const updateTargetRect = useCallback(() => {
    const element = document.querySelector(currentStep.target);
    if (!element) {
      setTargetRect(null);
      setPanelStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const rect = element.getBoundingClientRect();
    setTargetRect(rect);
    setPanelStyle(getPanelStyle(rect, currentStep.panelPlacement));
  }, [currentStep.panelPlacement, currentStep.target]);

  useEffect(() => {
    if (!showTutorial) {
      setStep(0);
      setTargetRect(null);
      closeInvestModal();
      return;
    }

    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [closeInvestModal, location.pathname, navigate, showTutorial]);

  useEffect(() => {
    if (!showTutorial) return undefined;

    window.scrollTo(0, 0);
    const scrollY = lockPageScroll();

    return () => {
      unlockPageScroll(scrollY);
    };
  }, [showTutorial]);

  useEffect(() => {
    if (!showTutorial) return;

    if (currentStep.openInvestModalOnEnter) {
      openInvestModal();
    }
    if (currentStep.closeInvestModalOnEnter) {
      closeInvestModal();
    }
  }, [
    closeInvestModal,
    currentStep.closeInvestModalOnEnter,
    currentStep.openInvestModalOnEnter,
    openInvestModal,
    showTutorial,
    step,
  ]);

  useEffect(() => {
    if (!showTutorial) return;

    const frame = window.requestAnimationFrame(updateTargetRect);
    const retry = window.setTimeout(updateTargetRect, 280);
    window.addEventListener('resize', updateTargetRect);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(retry);
      window.removeEventListener('resize', updateTargetRect);
    };
  }, [currentStep.target, showTutorial, step, updateTargetRect]);

  useEffect(() => {
    if (!showTutorial) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        void dismissTutorial();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dismissTutorial, showTutorial]);

  const handleContinue = () => {
    if (isLastStep) {
      closeInvestModal();
      void dismissTutorial();
      return;
    }

    if (currentStep.openInvestModalOnContinue) {
      openInvestModal();
    }

    setStep((value) => value + 1);
  };

  const handleSkip = () => {
    closeInvestModal();
    void dismissTutorial();
  };

  if (!showTutorial) return null;

  const continueLabel =
    isLastStep ? 'Got it' : currentStep.openInvestModalOnContinue ? 'Continue' : 'Next';

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden pointer-events-none">
      <SpotlightOverlay rect={targetRect} maskId={maskId} />

      <aside
        className="fixed z-[125] w-[20rem] pointer-events-auto"
        style={panelStyle}
        role="dialog"
        aria-labelledby="tour-title"
      >
        <div className="rounded-2xl border border-white/10 bg-[#131316] p-5 shadow-2xl shadow-black/70">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs font-medium text-indigo-400">
              Tutorial {step + 1}/{TOUR_STEPS.length}
            </p>
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip
            </button>
          </div>

          <h2 id="tour-title" className="font-display font-bold text-lg text-white mb-2">
            {currentStep.title}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">{currentStep.description}</p>

          <div className="flex items-center gap-2 mb-4">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= step ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
          >
            {continueLabel}
          </button>
        </div>
      </aside>
    </div>
  );
}
