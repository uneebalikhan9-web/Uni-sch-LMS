import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

export default function VideoPlayer({ videoId, assignmentId, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const watchTimeRef = useRef(0);
  const intervalRef = useRef(null);
  
  // Opts for react-youtube
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  const onStateChange = (event) => {
    // event.data: 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        watchTimeRef.current += 10;
        // Ping backend every 10 seconds
        fetch('/api/student-submissions/watch-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            assignment_id: assignmentId,
            seconds_watched: 10
          })
        }).catch(err => console.error('Watch time ping failed', err));
      }, 10000);
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
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onStateChange={onStateChange} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
          iframeClassName="youtube-iframe"
        />
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
