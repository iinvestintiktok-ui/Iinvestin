import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAction, useConvex } from 'convex/react';
import { X } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TiktokHandleSearch, { type TiktokProfile } from './TiktokHandleSearch';

interface Props {
  open: boolean;
  onClose: () => void;
}

type AuthStep =
  | 'email'
  | 'login'
  | 'signup-tiktok'
  | 'signup-nickname'
  | 'signup-password'
  | 'signup-confirm';

const TIKTOK_ICON = 'https://i.imgur.com/HfiGz3I.png';

const STEP_TITLES: Record<AuthStep, string> = {
  email: 'Sign in to KWAÏ.bet',
  login: 'Enter your password',
  'signup-tiktok': 'Your TikTok handle',
  'signup-nickname': 'Choose a nickname',
  'signup-password': 'Create a password',
  'signup-confirm': 'Confirm your password',
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function AuthModal({ open, onClose }: Props) {
  const convex = useConvex();
  const { login } = useAuth();
  const { showToast } = useToast();
  const signUp = useAction(api.auth.signUp);
  const loginAction = useAction(api.auth.login);

  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tiktokQuery, setTiktokQuery] = useState('');
  const [selectedTiktokProfile, setSelectedTiktokProfile] = useState<TiktokProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      setStep('email');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTiktokQuery('');
      setSelectedTiktokProfile(null);
      setNickname('');
      setError(null);
      setIsSubmitting(false);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  const resetError = () => setError(null);

  const handleEmailContinue = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    resetError();
    setIsSubmitting(true);

    try {
      const result = await convex.query(api.auth.checkEmail, { email: trimmedEmail });
      setStep(result.exists ? 'login' : 'signup-tiktok');
    } catch {
      setError('Unable to verify this email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) return;

    resetError();
    setIsSubmitting(true);

    try {
      const result = await loginAction({ email: email.trim(), password });
      login(result.token);
      showToast('Login successfully');
      onClose();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    resetError();
    setIsSubmitting(true);

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        tiktokHandle: selectedTiktokProfile?.uniqueId ?? '',
        nickname,
      });
      login(result.token, { showTutorial: true });
      showToast('Account successfully created');
      onClose();
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    resetError();
    if (step === 'login' || step === 'signup-tiktok') {
      setStep('email');
      setPassword('');
      return;
    }
    if (step === 'signup-nickname') {
      setStep('signup-tiktok');
      return;
    }
    if (step === 'signup-password') {
      setStep('signup-nickname');
      setPassword('');
      return;
    }
    if (step === 'signup-confirm') {
      setStep('signup-password');
      setConfirmPassword('');
    }
  };

  const secondaryButtonClass =
    'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1a1a1f] text-sm font-medium text-white hover:bg-[#222228] transition-colors';

  const primaryButtonClass =
    'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

  const inputClass =
    'w-full rounded-xl bg-[#0a0a0c] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-white/30 transition-colors';

  const title = STEP_TITLES[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close sign in dialog"
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`relative w-full max-w-[520px] overflow-visible rounded-2xl border border-white/10 bg-[#131316] p-8 sm:p-9 shadow-2xl shadow-black/50 transition-[opacity,transform] duration-200 ease-out ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.94]'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2
          id="auth-modal-title"
          className="font-display font-bold text-2xl sm:text-3xl text-white text-center pr-8 mb-6"
        >
          {title}
        </h2>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="min-h-[19.5rem]">
        {step === 'email' && (
          <div className="space-y-5">
            <form onSubmit={handleEmailContinue} className="space-y-3">
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className={inputClass}
                  autoFocus
                />
              </label>
              <button
                type="submit"
                disabled={!email.trim() || isSubmitting}
                className={primaryButtonClass}
              >
                {isSubmitting ? 'Checking...' : 'Continue with email'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-500">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
              <button type="button" className={`${secondaryButtonClass} relative`}>
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#0a0a0c] text-[10px] font-medium text-gray-300">
                  Recent
                </span>
                <GoogleIcon />
                Continue with Google
              </button>

              <button type="button" className={secondaryButtonClass}>
                <img
                  src={TIKTOK_ICON}
                  alt=""
                  aria-hidden="true"
                  className="w-5 h-5 rounded-full object-cover"
                />
                Continue with TikTok
              </button>
            </div>
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-sm text-gray-500">{email}</p>

            <label className="block space-y-2">
              <span className="text-sm text-gray-300">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoFocus
                className={inputClass}
              />
            </label>

            <button type="submit" disabled={!password || isSubmitting} className={primaryButtonClass}>
              {isSubmitting ? 'Signing in...' : 'Log in'}
            </button>

            <button
              type="button"
              onClick={goBack}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {step === 'signup-tiktok' && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!selectedTiktokProfile) return;
              resetError();
              setStep('signup-nickname');
            }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-500">{email}</p>

            <TiktokHandleSearch
              query={tiktokQuery}
              selected={selectedTiktokProfile}
              onQueryChange={setTiktokQuery}
              onSelect={setSelectedTiktokProfile}
              inputClassName={inputClass}
            />

            <div className="relative z-0 space-y-4">
              <button type="submit" disabled={!selectedTiktokProfile} className={primaryButtonClass}>
                Continue
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {step === 'signup-nickname' && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (nickname.trim().length < 2) {
                setError('Nickname must be at least 2 characters.');
                return;
              }
              resetError();
              setStep('signup-password');
            }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-500">@{selectedTiktokProfile?.uniqueId}</p>

            <label className="block space-y-2">
              <span className="text-sm text-gray-300">Nickname</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="How others will see you"
                autoFocus
                className={inputClass}
              />
            </label>

            <button type="submit" disabled={nickname.trim().length < 2} className={primaryButtonClass}>
              Continue
            </button>

            <button
              type="button"
              onClick={goBack}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {step === 'signup-password' && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (password.length < 8) {
                setError('Password must be at least 8 characters.');
                return;
              }
              resetError();
              setStep('signup-confirm');
            }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-500">{nickname}</p>

            <label className="block space-y-2">
              <span className="text-sm text-gray-300">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoFocus
                className={inputClass}
              />
            </label>

            <button type="submit" disabled={password.length < 8} className={primaryButtonClass}>
              Continue
            </button>

            <button
              type="button"
              onClick={goBack}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {step === 'signup-confirm' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <p className="text-sm text-gray-500">One last step for {nickname}</p>

            <label className="block space-y-2">
              <span className="text-sm text-gray-300">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoFocus
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              disabled={!confirmPassword || isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <button
              type="button"
              onClick={goBack}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Back
            </button>
          </form>
        )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400 text-center leading-relaxed px-1">
            By signing in, you accept the{' '}
            <Link
              to="/terms-of-use"
              onClick={onClose}
              className="text-gray-200 hover:text-white transition-colors underline underline-offset-2"
            >
              Terms of Use
            </Link>
            {' '}and{' '}
            <Link
              to="/privacy-policy"
              onClick={onClose}
              className="text-gray-200 hover:text-white transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
