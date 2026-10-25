import { useState } from 'react';
import { Volume2, Mic, MicOff, Pause, Play, Captions, PhoneOff, Video, AlertTriangle, Eye, Bell } from 'lucide-react';

export default function MockVideoCall({ onClose }: { onClose: () => void }) {
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(true);
  const [volume, setVolume] = useState(80);
  const [balance, setBalance] = useState(0);

  if (callState === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-label="Incoming video call alert">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border-4 border-calm-600 text-center space-y-6">
          {/* Avatar with glowing ring */}
          <div className="w-24 h-24 mx-auto rounded-full bg-calm-100 border-4 border-calm-500 flex items-center justify-center text-4xl shadow-md animate-pulse">
            👩
          </div>

          <div>
            <span className="text-xs font-bold tracking-widest text-calm-700 uppercase">INCOMING VIDEO CALL</span>
            <h2 className="text-3xl font-extrabold text-neutral-900 mt-1">Maria</h2>
            <p className="text-neutral-600 font-medium">Your daughter</p>
          </div>

          {/* Alert badges */}
          <div className="space-y-2 text-left bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-sm">
            <div className="flex items-center gap-2 text-neutral-700">
              <Eye className="w-4 h-4 text-calm-600 flex-shrink-0" />
              <span>Screen is flashing — Maria is calling</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Bell className="w-4 h-4 text-warning-600 flex-shrink-0" />
              <span>Desktop notification shown — and your connected devices are alerted</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Captions className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>Live captions will be on during the call</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 px-6 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-bold text-lg transition-colors cursor-pointer border-2 border-red-300"
              onClick={onClose}
              aria-label="Decline video call"
            >
              <span>📵</span>
              <span>Decline</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-colors cursor-pointer shadow-md"
              onClick={() => setCallState('active')}
              aria-label="Answer video call"
            >
              <span>📹</span>
              <span>Answer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900 text-white flex flex-col" role="region" aria-label="Active video call with Maria">
      {/* Top Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Maria</h1>
          <p className="text-sm text-neutral-400">Your daughter · Video call</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </header>

      {/* Video Viewport Area */}
      <div className="flex-1 relative flex items-center justify-center bg-neutral-950 p-6">
        <div className="w-full h-full max-w-4xl max-h-[60vh] bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-center relative overflow-hidden shadow-2xl">
          <span className="text-8xl" role="img" aria-label="Maria's video stream">
            👩
          </span>

          {/* Live Caption Bar */}
          {captionsVisible && (
            <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md text-white px-6 py-4 rounded-xl border border-white/20 flex items-center gap-3 shadow-lg" role="status" aria-live="polite">
              <span className="bg-sky-500/30 text-sky-300 px-2.5 py-1 rounded text-xs font-bold border border-sky-500/40">
                [CC LIVE]
              </span>
              <span className="text-lg font-medium tracking-wide">
                "Hi Mum! Can you hear me? You're looking well today."
              </span>
            </div>
          )}

          {/* Floating Self-Preview Box */}
          <div className="absolute top-6 right-6 w-36 h-28 bg-neutral-800 rounded-xl border-2 border-neutral-700 flex items-center justify-center shadow-lg" role="img" aria-label="Your video preview">
            <span className="text-4xl">👵</span>
          </div>
        </div>
      </div>

      {/* Controls & Sliders Panel */}
      <div className="bg-neutral-800 border-t border-neutral-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Sliders */}
        <div className="flex flex-col gap-3 w-full md:w-72">
          {/* Volume Slider */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-calm-500 cursor-pointer"
              aria-label={`Call volume ${volume}%`}
            />
            <span className="text-sm font-semibold w-10 text-right tabular-nums text-neutral-300">{volume}%</span>
          </div>

          {/* Audio Balance Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-400">L</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.1}
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full accent-calm-500 cursor-pointer"
              aria-label="Audio balance"
            />
            <span className="text-xs font-bold text-neutral-400">R</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-semibold text-xs transition-colors cursor-pointer border ${
              isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
            }`}
            onClick={() => setIsMuted(!isMuted)}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-6 h-6 mb-1" /> : <Mic className="w-6 h-6 mb-1" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            type="button"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-semibold text-xs transition-colors cursor-pointer border ${
              isAudioPaused
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
            }`}
            onClick={() => setIsAudioPaused(!isAudioPaused)}
            aria-pressed={isAudioPaused}
            aria-label={isAudioPaused ? 'Resume audio' : 'Pause audio'}
          >
            {isAudioPaused ? <Play className="w-6 h-6 mb-1" /> : <Pause className="w-6 h-6 mb-1" />}
            <span>{isAudioPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            type="button"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-semibold text-xs transition-colors cursor-pointer border ${
              captionsVisible
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
            }`}
            onClick={() => setCaptionsVisible(!captionsVisible)}
            aria-pressed={captionsVisible}
            aria-label={captionsVisible ? 'Hide captions' : 'Show captions'}
          >
            <Captions className="w-6 h-6 mb-1" />
            <span>{captionsVisible ? 'Hide CC' : 'Show CC'}</span>
          </button>
        </div>

        {/* End Call Button */}
        <button
          type="button"
          className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-base transition-colors cursor-pointer shadow-lg"
          onClick={onClose}
          aria-label="End video call"
        >
          End call
        </button>
      </div>
    </div>
  );
}
