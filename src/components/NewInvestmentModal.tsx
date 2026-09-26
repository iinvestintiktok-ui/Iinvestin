import { useAction } from 'convex/react';
import { Heart, Eye, Loader2, Users, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../convex/_generated/api';
import { useAppUi } from '../context/AppUiContext';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../lib/format';

interface Props {
  demoMode?: boolean;
  tourActive?: boolean;
}

interface PreviewData {
  videoKey: string;
  tiktokUrl: string;
  creatorHandle: string;
  creatorNickname: string;
  creatorAvatar: string | null;
  thumbnail: string | null;
  title: string;
  description: string;
  views: number;
  likes: number;
  followers: number;
}

export default function NewInvestmentModal({ demoMode = false, tourActive = false }: Props) {
  const { investModalOpen, closeInvestModal } = useAppUi();
  const { token } = useAuth();
  const previewTiktokVideo = useAction(api.investmentActions.previewTiktokVideo);
  const createInvestment = useAction(api.investmentActions.createInvestment);

  const [mounted, setMounted] = useState(investModalOpen);
  const [visible, setVisible] = useState(false);
  const [link, setLink] = useState('');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const resetForm = useCallback(() => {
    setLink('');
    setPreview(null);
    setPreviewLoading(false);
    setPreviewError(null);
    setSubmitting(false);
    setSubmitError(null);
  }, []);

  useEffect(() => {
    if (investModalOpen) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      resetForm();
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [investModalOpen, resetForm]);

  useEffect(() => {
    if (!link.trim()) {
      setPreview(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    setPreviewLoading(true);
    setPreviewError(null);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const result = await previewTiktokVideo({ url: link.trim() });
        if (!result) {
          setPreview(null);
          setPreviewError('Unable to load this video. Check the link and try again.');
          return;
        }
        setPreview(result);
      } catch {
        setPreview(null);
        setPreviewError('Unable to load this video. Check the link and try again.');
      } finally {
        setPreviewLoading(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [link, previewTiktokVideo]);

  const handleConfirm = async () => {
    if (demoMode || !preview || !token) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createInvestment({ token, url: link.trim() });
      closeInvestModal();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to place bet');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  const inputClass =
    'w-full rounded-xl bg-[#0a0a0c] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-white/30 transition-colors';

  const canConfirm = !demoMode && !!preview && !previewLoading && !submitting;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
      <button
        type="button"
        aria-label="Close investment dialog"
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 pointer-events-auto ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={tourActive ? () => {} : closeInvestModal}
        aria-hidden={tourActive}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invest-modal-title"
        className={`relative w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#131316] p-8 shadow-2xl shadow-black/50 transition-all duration-200 ease-out pointer-events-auto ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.94]'
        }`}
      >
        {!tourActive && (
          <button
            type="button"
            onClick={closeInvestModal}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <h2 id="invest-modal-title" className="font-display font-bold text-2xl text-white mb-2 pr-8">
          New investment
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Paste a TikTok link. Your position starts at 0% and moves up or down based on hourly view and like growth.
        </p>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-gray-300">TikTok video link</span>
            <input
              type="url"
              data-tour="invest-link-input"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://www.tiktok.com/@creator/video/..."
              className={inputClass}
            />
          </label>

          {(previewLoading || preview || previewError) && (
            <div data-tour="invest-preview" className="rounded-xl border border-white/10 bg-[#0a0a0c] overflow-hidden">
              {previewLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading preview...
                </div>
              ) : previewError ? (
                <p className="px-4 py-6 text-sm text-rose-400">{previewError}</p>
              ) : preview ? (
                <div className="flex gap-3 p-3">
                  <div className="relative w-[72px] flex-shrink-0 aspect-[9/16] rounded-lg overflow-hidden bg-[#1a1a1f]">
                    {preview.thumbnail ? (
                      <img
                        src={preview.thumbnail}
                        alt={preview.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      {preview.creatorAvatar ? (
                        <img
                          src={preview.creatorAvatar}
                          alt={preview.creatorNickname}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10" />
                      )}
                      <span className="text-sm font-medium text-white truncate">
                        @{preview.creatorHandle}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 line-clamp-2 leading-snug">
                      {preview.title || 'Untitled video'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(preview.views)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(preview.likes)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatNumber(preview.followers)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Starting position: <span className="text-white font-medium">0%</span>
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {submitError ? (
            <p className="text-sm text-rose-400">{submitError}</p>
          ) : null}

          <button
            type="button"
            data-tour="invest-confirm"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Placing bet...
              </>
            ) : demoMode ? (
              'Confirm investment (demo)'
            ) : (
              'Place bet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
