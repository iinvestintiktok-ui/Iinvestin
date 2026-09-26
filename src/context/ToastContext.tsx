import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;
const TOAST_EXIT_MS = 280;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const clearTimeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (clearTimeoutRef.current !== null) {
      window.clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (nextMessage: string) => {
      clearTimers();
      setVisible(false);

      window.setTimeout(() => {
        setMessage(nextMessage);
        window.requestAnimationFrame(() => {
          setVisible(true);
        });

        hideTimeoutRef.current = window.setTimeout(() => {
          setVisible(false);
        }, TOAST_DURATION_MS);

        clearTimeoutRef.current = window.setTimeout(() => {
          setMessage(null);
        }, TOAST_DURATION_MS + TOAST_EXIT_MS);
      }, 20);
    },
    [clearTimers],
  );

  const dismiss = useCallback(() => {
    clearTimers();
    setVisible(false);
    window.setTimeout(() => setMessage(null), TOAST_EXIT_MS);
  }, [clearTimers]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div
          className={`fixed top-5 left-1/2 z-[130] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 transition-all duration-300 ease-out ${
            visible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-[#131316] px-4 py-3.5 shadow-2xl shadow-black/60">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <p className="flex-1 text-sm text-white">{message}</p>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md p-1 text-gray-500 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
