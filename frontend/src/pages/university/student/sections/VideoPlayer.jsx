import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SpeakerHigh, SpeakerSlash, CornersOut } from '@phosphor-icons/react';
import API_BASE_URL from '../../../../config/api';

export default function VideoPlayer({ videoId, assignmentId, onClose, onVideoEnd }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [player, setPlayer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const watchTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const playerContainerRef = useRef(null);
  
  // Opts for react-youtube
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      fs: 0,
      controls: 0,
      disablekb: 1,
    },
  };

  const onStateChange = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      setIsPlaying(false);
      if (onVideoEnd) onVideoEnd();
    }
  };

  const onReady = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
  };

  const handleOverlayClick = () => {
    if (player) {
      const state = player.getPlayerState();
      if (state === 1) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (player) {
      player.seekTo(time);
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    // Handle tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        watchTimeRef.current += 5;
        // Ping backend every 5 seconds
        fetch(`${API_BASE_URL}/api/submissions/watch-time`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify({
            assignment_id: assignmentId,
            seconds_watched: 5
          })
        }).catch(err => console.error('Watch time ping failed', err));
      }, 5000);
      
      timeUpdateIntervalRef.current = setInterval(() => {
        if (player) {
          setCurrentTime(player.getCurrentTime());
        }
      }, 1000);
      
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    };
  }, [isPlaying, assignmentId, player]);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <div ref={playerContainerRef} style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, pointerEvents: 'auto' }}>
          <YouTube 
            videoId={videoId} 
            opts={opts} 
            onStateChange={onStateChange} 
            onReady={onReady}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
            iframeClassName="youtube-iframe"
          />
          {/* 100% Transparent overlay covering the entire video to block ALL YouTube interactions */}
          <div 
            onClick={handleOverlayClick}
            style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'transparent', cursor: 'pointer' }} 
            title="Click to play/pause"
          ></div>
          <style>{`.youtube-iframe { width: 100%; height: 100%; border: none; }`}</style>
        </div>
        
        {/* Custom Controls Bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '48px', 
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5))', 
          zIndex: 60, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px'
        }}>
          <button onClick={handleOverlayClick} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
          </button>
          
          <div style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace', minWidth: '85px' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            style={{ flex: 1, cursor: 'pointer', accentColor: '#4f46e5' }}
          />
          
          <button onClick={toggleMute} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isMuted ? <SpeakerSlash size={22} weight="fill" /> : <SpeakerHigh size={22} weight="fill" />}
          </button>
          
          <button onClick={toggleFullscreen} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <CornersOut size={22} weight="bold" />
          </button>
        </div>
      </div>
      <button 
        onClick={onClose}
        style={{ marginTop: '12px', padding: '6px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
      >
        Close Video
      </button>
    </>
  );
}
