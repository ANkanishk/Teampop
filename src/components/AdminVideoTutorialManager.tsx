import React, { useState, useEffect } from 'react';
import { Play, Video, Save, Check, RefreshCw, Upload, Globe, HelpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';

export const AdminVideoTutorialManager: React.FC = () => {
  const { settings, updateSettings } = useTournaments();
  const [generalVideoUrl, setGeneralVideoUrl] = useState(settings.tutorialVideoUrl || '');
  const [loginVideoUrl, setLoginVideoUrl] = useState(settings.loginTutorialVideoUrl || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<'general' | 'login' | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings.tutorialVideoUrl) {
      setGeneralVideoUrl(settings.tutorialVideoUrl);
    }
    if (settings.loginTutorialVideoUrl) {
      setLoginVideoUrl(settings.loginTutorialVideoUrl);
    }
  }, [settings.tutorialVideoUrl, settings.loginTutorialVideoUrl]);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    setUploadError(null);
    try {
      updateSettings({
        tutorialVideoUrl: generalVideoUrl.trim(),
        loginTutorialVideoUrl: loginVideoUrl.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      console.error('Error saving video settings', e);
      setUploadError(e.message || 'Failed to save video settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'general' | 'login') => {
    setUploadError(null);
    setUploadSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (.mp4, .webm, .mov, etc.)');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      setUploadError('Video file size exceeds 80MB. For larger videos, please upload to YouTube/Google Drive and paste the link.');
      return;
    }

    setUploadingTarget(target);

    try {
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read video file from device'));
        reader.readAsDataURL(file);
      });

      const videoBase64 = await fileDataPromise;

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData: videoBase64,
          fileName: file.name,
          target: target === 'general' ? 'main' : 'login',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server failed to save video');
      }

      const permanentUrl = data.url;
      if (target === 'general') {
        setGeneralVideoUrl(permanentUrl);
        updateSettings({ tutorialVideoUrl: permanentUrl });
      } else {
        setLoginVideoUrl(permanentUrl);
        updateSettings({ loginTutorialVideoUrl: permanentUrl });
      }

      setUploadSuccessMsg(`🎉 Video uploaded and saved to server (${file.name})! It will now play permanently.`);
      setTimeout(() => setUploadSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('[Video Upload Failed]', err);
      setUploadError(err.message || 'Failed to upload video to server. Please retry.');
    } finally {
      setUploadingTarget(null);
      // Reset input value
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
                <Video className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Video Tutorials & Guide Management</h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Upload local MP4 videos or paste YouTube links for Home & Login tutorials. Saved permanently to server storage.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || uploadingTarget !== null}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Video URLs'}</span>
              </>
            )}
          </button>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{uploadSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* General Tutorial Video */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-orange-400" />
                <span>1. Home / Tournaments Guide Video</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded font-medium">
                Home Lobby
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Explains how to choose matches, submit UPI entry fee, and receive Room ID.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                YouTube URL / Direct Video Link / Server File
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={generalVideoUrl}
                  onChange={(e) => setGeneralVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or /uploads/... link"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Upload from Device (Permanently stored on Server)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  disabled={uploadingTarget === 'general'}
                  onChange={(e) => handleFileUpload(e, 'general')}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 cursor-pointer disabled:opacity-50"
                />
                {uploadingTarget === 'general' && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-orange-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading video to server disk... Please wait.</span>
                  </div>
                )}
              </div>
            </div>

            {generalVideoUrl && (
              <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-neutral-700 bg-black">
                {generalVideoUrl.includes('youtube') || generalVideoUrl.includes('youtu.be') ? (
                  <iframe
                    src={generalVideoUrl.includes('embed') ? generalVideoUrl : `https://www.youtube.com/embed/${new URL(generalVideoUrl.startsWith('http') ? generalVideoUrl : `https://${generalVideoUrl}`).searchParams.get('v') || ''}`}
                    title="General Video Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video src={generalVideoUrl} controls className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </div>

          {/* Login/Register Modal Tutorial Video */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>2. Login / Sign-Up Modal Video</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded font-medium">
                Auth Popup
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Helps new users learn how to register with email/phone, set password, and claim signup bonus.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                YouTube URL / Direct Video Link / Server File
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={loginVideoUrl}
                  onChange={(e) => setLoginVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or /uploads/... link"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Upload from Device (Permanently stored on Server)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  disabled={uploadingTarget === 'login'}
                  onChange={(e) => handleFileUpload(e, 'login')}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer disabled:opacity-50"
                />
                {uploadingTarget === 'login' && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading video to server disk... Please wait.</span>
                  </div>
                )}
              </div>
            </div>

            {loginVideoUrl && (
              <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-neutral-700 bg-black">
                {loginVideoUrl.includes('youtube') || loginVideoUrl.includes('youtu.be') ? (
                  <iframe
                    src={loginVideoUrl.includes('embed') ? loginVideoUrl : `https://www.youtube.com/embed/${new URL(loginVideoUrl.startsWith('http') ? loginVideoUrl : `https://${loginVideoUrl}`).searchParams.get('v') || ''}`}
                    title="Login Video Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video src={loginVideoUrl} controls className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
