import { useState } from 'react';
import { Icon } from './Icon';

export function MockVideoCall({ onClose }: { onClose: () => void }) {
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(true);
  const [volume, setVolume] = useState(80);
  const [balance, setBalance] = useState(0);

  if (callState === 'incoming') {
    return (
      <div className="incoming-call-overlay" role="dialog" aria-label="Incoming video call alert">
        <div className="incoming-call-card">
          {/* Avatar with glowing ring */}
          <div className="incoming-call-avatar-wrap">
            <span className="incoming-call-avatar" role="img" aria-label="Maria">
              👩
            </span>
          </div>

          <span className="incoming-call-eyebrow">INCOMING VIDEO CALL</span>
          <h2 className="incoming-call-name">Maria</h2>
          <p className="incoming-call-sub">Your daughter</p>

          {/* Alert badges */}
          <div className="incoming-call-badges">
            <div className="incoming-call-badge">
              <Icon name="visibility" size={18} />
              <span>Screen is flashing — Maria is calling</span>
            </div>
            <div className="incoming-call-badge">
              <Icon name="alert" size={18} />
              <span>Desktop notification shown — and your connected devices are alerted</span>
            </div>
            <div className="incoming-call-badge">
              <Icon name="captions" size={18} />
              <span>Live captions will be on during the call</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="incoming-call-actions">
            <button
              type="button"
              className="call-btn call-btn--decline"
              onClick={onClose}
              aria-label="Decline video call"
            >
              <span className="call-btn-icon">📵</span>
              <span>Decline</span>
            </button>

            <button
              type="button"
              className="call-btn call-btn--answer"
              onClick={() => setCallState('active')}
              aria-label="Answer video call"
            >
              <span className="call-btn-icon">📹</span>
              <span>Answer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="active-call-container" role="region" aria-label="Active video call with Maria">
      {/* Top Header */}
      <header className="active-call-header">
        <div className="active-call-title-block">
          <h1 className="active-call-name">Maria</h1>
          <p className="active-call-sub">Your daughter · Video call</p>
          <span className="active-call-live-pill">🟢 Live</span>
        </div>
      </header>

      {/* Video Viewport Area */}
      <div className="active-call-viewport">
        {/* Main Remote Video (Avatar in center) */}
        <div className="active-call-remote">
          <span className="active-call-remote-avatar" role="img" aria-label="Maria's video stream">
            👩
          </span>

          {/* Live Caption Bar */}
          {captionsVisible && (
            <div className="active-call-caption-bar" role="status" aria-live="polite">
              <span className="cc-tag">[CC LIVE]</span>
              <span className="caption-text">
                "Hi Mum! Can you hear me? You're looking well today."
              </span>
            </div>
          )}

          {/* Floating Self-Preview Box */}
          <div className="active-call-self-preview" role="img" aria-label="Your video preview">
            <span className="self-avatar">👵</span>
          </div>
        </div>
      </div>

      {/* Controls & Sliders Panel */}
      <div className="active-call-controls-panel">
        {/* Sliders */}
        <div className="active-call-sliders">
          {/* Volume Slider */}
          <div className="call-slider-row">
            <Icon name="volume" size={18} />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="call-slider"
              aria-label={`Call volume ${volume}%`}
            />
            <span className="call-slider-value">{volume}%</span>
          </div>

          {/* Audio Balance Slider */}
          <div className="call-slider-row">
            <span className="call-slider-label">L</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.1}
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="call-slider"
              aria-label="Audio balance"
            />
            <span className="call-slider-label">R</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="active-call-buttons">
          <button
            type="button"
            className={`call-action-circle ${isMuted ? 'call-action-circle--active' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            <span className="circle-icon">🎤</span>
            <span className="circle-label">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            type="button"
            className={`call-action-circle ${isAudioPaused ? 'call-action-circle--active' : ''}`}
            onClick={() => setIsAudioPaused(!isAudioPaused)}
            aria-pressed={isAudioPaused}
            aria-label={isAudioPaused ? 'Resume audio' : 'Pause audio'}
          >
            <span className="circle-icon">⏸</span>
            <span className="circle-label">{isAudioPaused ? 'Resume audio' : 'Pause audio'}</span>
          </button>

          <button
            type="button"
            className={`call-action-circle ${captionsVisible ? 'call-action-circle--active' : ''}`}
            onClick={() => setCaptionsVisible(!captionsVisible)}
            aria-pressed={captionsVisible}
            aria-label={captionsVisible ? 'Hide captions' : 'Show captions'}
          >
            <span className="circle-icon-text">CC</span>
            <span className="circle-label">{captionsVisible ? 'Hide captions' : 'Show captions'}</span>
          </button>
        </div>

        {/* End Call Button */}
        <button
          type="button"
          className="btn-end-call"
          onClick={onClose}
          aria-label="End video call"
        >
          End call
        </button>
      </div>
    </div>
  );
}
