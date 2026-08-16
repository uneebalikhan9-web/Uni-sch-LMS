import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import API_BASE_URL from '../../../config/api';

export default function VideoPlayer({ videoId, assignmentId, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true); // Start playing immediately when opened
  const watchTimeRef = useRef(0);
  const intervalRef = useRef(null);
  
  // Opts for react-youtube
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      fs: 1,
    },
  };

  const onStateChange = (event) => {
    // We optionally keep this if we want to pause when video pauses
    // event.data: 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) {
      setIsPlaying(false);
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
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, assignmentId]);

  return (
    <>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000', pointerEvents: 'auto' }}>
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onStateChange={onStateChange} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
          iframeClassName="youtube-iframe"
        />
        {/* Transparent overlay to block clicks on the YouTube title and channel logo at the top */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '80px', zIndex: 50, background: 'transparent' }} title="Video playing"></div>
        {/* Transparent overlay to block clicks on the YouTube logo at the bottom right if it appears */}
        <div style={{ position: 'absolute', bottom: '50px', right: '10px', width: '100px', height: '40px', zIndex: 50, background: 'transparent' }}></div>
        <style>{`.youtube-iframe { width: 100%; height: 100%; border: none; }`}</style>
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
