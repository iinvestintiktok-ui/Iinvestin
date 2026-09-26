import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Camera, ExternalLink, Loader2, Pencil } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import InvestmentCard from '../components/InvestmentCard';
import { InvestmentListSkeleton, InvestorProfileSkeleton } from '../components/ProfilePageSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatJoinedDate, formatKwai } from '../lib/format';

const MAX_AVATAR_BYTES = 500_000;

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read image'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image'));
    reader.readAsDataURL(file);
  });
}

interface EditableHoverFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  displayClassName?: string;
  inputClassName?: string;
  prefix?: string;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
}

function EditableHoverField({
  value,
  onSave,
  displayClassName = '',
  inputClassName = '',
  prefix = '',
  maxLength = 32,
  minLength = 2,
  placeholder = '',
}: EditableHoverFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const commit = async () => {
    const trimmed = draft.trim();
    if (trimmed.length < minLength) {
      cancel();
      return;
    }

    if (trimmed === value) {
      setEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      cancel();
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void commit();
    }
    if (event.key === 'Escape') {
      cancel();
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        disabled={isSaving}
        placeholder={placeholder}
        className={inputClassName}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group inline-flex items-center gap-2 max-w-full text-left"
    >
      <span className={displayClassName}>
        {prefix}{value}
      </span>
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#131316] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Pencil className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

export default function MePage() {
  const { user, token, isLoading } = useAuth();
  const { showToast } = useToast();
  const updateProfile = useMutation(api.auth.updateProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const investorArgs = useMemo(
    () => (user?.investorSlug ? { slug: user.investorSlug } : 'skip'),
    [user?.investorSlug],
  );
  const investorBetsArgs = useMemo(
    () => (user?.investorSlug ? { investorSlug: user.investorSlug } : 'skip'),
    [user?.investorSlug],
  );

  const investor = useQuery(api.investors.getBySlug, investorArgs);
  const stats = useQuery(api.investors.getStats, investorArgs);
  const investorBets = useQuery(api.investments.listByInvestor, investorBetsArgs);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  if (!token && !isLoading) {
    return <Navigate to="/" replace />;
  }

  if (isLoading || user === undefined || investor === undefined || stats === undefined) {
    return <InvestorProfileSkeleton />;
  }

  if (!user || !investor || !stats) {
    return <Navigate to="/" replace />;
  }

  const displayAvatar = avatarPreview ?? investor.avatarUrl;

  const statCards = [
    { label: 'Current rank', value: `#${stats.rank}`, color: 'text-amber-400' },
    {
      label: 'Total profit',
      value: `${stats.totalProfit > 0 ? '+' : ''}${formatKwai(stats.totalProfit)}`,
      color: stats.totalProfit > 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    { label: 'Win rate', value: `${stats.winRate}%`, color: 'text-indigo-400' },
    { label: 'Best hit', value: `+${Math.round((stats.bestMultiplier - 1) * 100)}%`, color: 'text-emerald-400' },
  ];

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file');
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      showToast('Image must be smaller than 500 KB');
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await readImageAsDataUrl(file);
      await updateProfile({ token, avatarUrl: dataUrl });
      setAvatarPreview(dataUrl);
      showToast('Profile photo updated');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!token) return;

    setIsUploading(true);
    try {
      await updateProfile({ token, avatarUrl: null });
      setAvatarPreview(null);
      showToast('Profile photo removed');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to remove photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveNickname = async (nickname: string) => {
    if (!token) return;

    try {
      await updateProfile({ token, nickname });
      showToast('Nickname updated');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update nickname');
      throw error;
    }
  };

  const handleSaveTiktokHandle = async (tiktokHandle: string) => {
    if (!token) return;

    try {
      await updateProfile({ token, tiktokHandle });
      showToast('TikTok handle updated');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update TikTok handle');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link
            to={`/investor/${user.investorSlug}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View public profile
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center sm:items-start gap-2 w-20 sm:w-24 shrink-0">
              <div className="relative group w-full">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={user.nickname}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl"
                  />
                ) : (
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${investor.avatarColor} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl`}>
                    {investor.tag}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                  aria-label="Change profile photo"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <p className="text-xs text-indigo-400 w-full text-center sm:text-left">
                My account
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-60"
                >
                  {isUploading ? 'Uploading…' : 'Import image'}
                </button>
                {displayAvatar && (
                  <>
                    <span className="text-gray-600">·</span>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className="text-gray-500 hover:text-rose-400 transition-colors disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              <EditableHoverField
                value={user.nickname}
                onSave={handleSaveNickname}
                displayClassName="font-display font-bold text-2xl sm:text-3xl text-white"
                inputClassName="w-full font-display font-bold text-2xl sm:text-3xl text-white bg-transparent border-b border-indigo-500/50 pb-1 focus:outline-none"
                placeholder="Your nickname"
              />

              <p className="text-gray-500 text-sm mt-2">
                Joined on {formatJoinedDate(investor.joinedAt)}
              </p>
              <p className="text-gray-500 text-sm mt-0.5">
                {stats.totalBets} total bet{stats.totalBets !== 1 ? 's' : ''} · {stats.winningBets} won
              </p>
              <p className="text-gray-500 text-sm mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <span>{user.email}</span>
                <span>·</span>
                <EditableHoverField
                  value={user.tiktokHandle}
                  onSave={handleSaveTiktokHandle}
                  prefix="@"
                  displayClassName="text-gray-500 text-sm"
                  inputClassName="w-40 text-sm text-white bg-transparent border-b border-indigo-500/50 pb-0.5 focus:outline-none"
                  placeholder="tiktokhandle"
                  maxLength={24}
                />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="p-5 rounded-xl bg-[#0a0a0c]">
                <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                <p className={`font-display font-bold text-2xl sm:text-3xl tabular-nums tracking-tight leading-none ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold text-xl text-white mb-4">
            Investment history
          </h2>
          {investorBets === undefined ? (
            <InvestmentListSkeleton />
          ) : (
            <div className="space-y-3">
              {investorBets.length > 0 ? (
                investorBets.map((inv) => (
                  <InvestmentCard key={inv.id} investment={inv} hideInvestor />
                ))
              ) : (
                <div className="card p-6 text-center text-sm text-gray-500">
                  No investments yet. Place your first bet from the home page.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
