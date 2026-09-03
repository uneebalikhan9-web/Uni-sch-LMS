import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import API_BASE_URL from '../../../../config/api';
import { Camera, CheckCircle, UserCircle, Warning, ArrowClockwise, SmileyWink, UserFocus, PlusCircle, FileText, XCircle, Lightbulb, Sparkle, X, Info, ShieldCheck, Clock } from '@phosphor-icons/react';

const MODELS_PATH = '/models';
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH);
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH);
  modelsLoaded = true;
}

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

const S = {
  wrap: { padding: '0', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' },
  sub: { color: '#64748b', fontSize: '14px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' },
  video: { width: '100%', borderRadius: '16px', background: '#0f172a', minHeight: '240px', border: '2px solid #e2e8f0', display: 'block', objectFit: 'cover' },
  videoWrap: { position: 'relative', marginBottom: '16px', borderRadius: '16px', overflow: 'hidden' },
  canvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '16px' },
  btn: { width: '100%', padding: '13px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s ease', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  btnPrimary: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', boxShadow: '0 4px 15px rgba(79,70,229,0.3)' },
  btnGreen: { background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' },
  btnGhost: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
  statusOk: { padding: '14px 18px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#065f46', fontSize: '14px', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  statusErr: { padding: '14px 18px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#991b1b', fontSize: '14px', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  statusWrn: { padding: '14px 18px', borderRadius: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#92400e', fontSize: '14px', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  statusInf: { padding: '14px 18px', borderRadius: '14px', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', color: '#3730a3', fontSize: '14px', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '14px 16px', color: '#334155', fontSize: '14px', borderBottom: '1px solid #f8fafc' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 },
  registerBanner: { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: '24px', padding: '32px', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' },
  regBannerText: { fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' },
  regBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 },
  regBannerBtn: { background: '#fff', color: '#4f46e5', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: '32px', fontWeight: 800, color: '#4f46e5', margin: '0 0 4px 0' },
  statLabel: { color: '#64748b', fontSize: '12px', fontWeight: 600 },
  numBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(79,70,229,0.1)', color: '#4f46e5', fontSize: '11px', fontWeight: 800, marginRight: '8px' }
};

export default function SDFaceAttendance({ user }) {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const [modReady, setModReady] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('mark'); // 'mark' | 'register'
  const [isRegistered, setIsRegistered] = useState(null); // null=loading, true/false
  const [myLog, setMyLog] = useState([]);
  const [capturedDescriptor, setCapturedDescriptor] = useState(null);
  const [allDescriptors, setAllDescriptors] = useState([]);

  const token = sessionStorage.getItem('token');
  const authH = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Load models and check registration
  useEffect(() => {
    loadModels().then(() => setModReady(true));
    checkRegistration();
    fetchMyLog();
  }, []);

  const checkRegistration = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/face-attendance/descriptors`, { headers: authH });
      const data = await res.json();
      const myName = user?.name;
      const registered = data.descriptors?.some(d => d.student_name === myName || d.label === myName);
      setIsRegistered(!!registered);
      setAllDescriptors(data.descriptors || []);
    } catch {
      setIsRegistered(false);
    }
  };

  const fetchMyLog = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/face-attendance/my-history`, { headers: authH });
      const data = await res.json();
      // Backend now filters by user, so we just set the log
      setMyLog(data.attendance || []);
    } catch {}
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      videoRef.current.srcObject = stream;
      await new Promise(r => videoRef.current.onloadedmetadata = r);
      if (overlayRef.current) {
        overlayRef.current.width = videoRef.current.videoWidth;
        overlayRef.current.height = videoRef.current.videoHeight;
      }
      setStreaming(true);
    } catch {
      setStatus({ t: 'err', m: 'Camera access denied. Please allow camera permission in browser.' });
    }
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  // ── Mark Attendance ──────────────────────────────────────────────────────
  const markAttendance = useCallback(async () => {
    if (!modReady || !streaming) return;
    setLoading(true);
    setStatus({ t: 'inf', m: '🔍 Scanning your face...' });
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setStatus({ t: 'err', m: 'No face detected. Look directly at the camera in good light.' });
        setLoading(false);
        return;
      }

      // Draw bounding box
      if (overlayRef.current) {
        const ctx = overlayRef.current.getContext('2d');
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        const box = detection.detection.box;
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }

      // Match with known descriptors
      let bestMatch = null, bestDist = Infinity;
      for (const known of allDescriptors) {
        const dist = euclideanDistance(Array.from(detection.descriptor), known.descriptor);
        if (dist < bestDist) { bestDist = dist; bestMatch = known; }
      }

      const THRESHOLD = 0.55;
      if (bestDist <= THRESHOLD && bestMatch) {
        // Mark via API
        const res = await fetch(`${API_BASE_URL}/api/face-attendance/mark`, {
          method: 'POST',
          headers: authH,
          body: JSON.stringify({ student_id: bestMatch.student_id })
        });
        const data = await res.json();
        if (data.status === 'already_marked') {
          setStatus({ t: 'wrn', m: 'Your attendance is already marked for today! See you tomorrow.' });
        } else {
          setStatus({ t: 'ok', m: `Attendance marked successfully! Welcome, ${bestMatch.student_name}` });
          fetchMyLog();
          stopCamera();
        }
      } else {
        setStatus({ t: 'err', m: 'Face not recognized. Make sure you have registered your face first.' });
      }
    } catch (e) {
      setStatus({ t: 'err', m: 'Error during face scan: ' + e.message });
    } finally {
      setLoading(false);
    }
  }, [modReady, streaming, allDescriptors]);

  // ── Register Face ────────────────────────────────────────────────────────
  const captureForRegistration = async () => {
    if (!modReady || !streaming) return;
    setLoading(true);
    setStatus({ t: 'inf', m: 'Detecting your face...' });
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setStatus({ t: 'err', m: 'No face detected. Please look at the camera clearly.' });
      } else {
        setCapturedDescriptor(detection.descriptor);
        setStatus({ t: 'ok', m: 'Face captured! Click "Save My Face" to register.' });
      }
    } catch (e) {
      setStatus({ t: 'err', m: 'Capture error: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  const saveMyFace = async () => {
    if (!capturedDescriptor) return;
    setLoading(true);
    try {
      // Get student_id first
      const meRes = await fetch(`${API_BASE_URL}/api/face-attendance/students`, { headers: authH });
      const meData = await meRes.json();
      const myRecord = meData.students?.find(s => s.name === user?.name);
      if (!myRecord) {
        setStatus({ t: 'err', m: 'Student record not found. Please contact admin.' });
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/face-attendance/register`, {
        method: 'POST',
        headers: authH,
        body: JSON.stringify({ student_id: myRecord.student_id, label: user?.name, descriptor: Array.from(capturedDescriptor) })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ t: 'ok', m: 'Your face has been registered! You can now mark daily attendance.' });
        setIsRegistered(true);
        setCapturedDescriptor(null);
        stopCamera();
        checkRegistration();
        setTab('mark');
      } else {
        setStatus({ t: 'err', m: data.message });
      }
    } catch {
      setStatus({ t: 'err', m: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const presentCount = myLog.length;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={S.wrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>
          <UserFocus size={32} weight="duotone" color="#4f46e5" />
          Face Attendance
        </h1>
        <p style={S.sub}>AI-powered smart attendance — no manual sign-in needed</p>
      </div>

      {/* Registration Banner (if not registered) */}
      {isRegistered === false && (
        <div style={S.registerBanner}>
          <div>
            <p style={S.regBannerText}>
              <Sparkle size={24} weight="fill" color="#fff" />
              One-time Face Setup Required
            </p>
            <p style={S.regBannerSub}>Register your face once to enable daily attendance marking</p>
          </div>
          <button style={S.regBannerBtn} onClick={() => setTab('register')}>
            Register My Face
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', borderRadius: '16px', padding: '5px', width: 'fit-content' }}>
        {[
          { key: 'mark', label: 'Mark Attendance', icon: <Camera size={16} /> },
          { key: 'register', label: isRegistered ? 'Update Face' : 'Register Face', icon: <PlusCircle size={16} /> },
          { key: 'history', label: 'My Log', icon: <FileText size={16} /> },
        ].map(t => (
          <button
            key={t.key}
            style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
              background: tab === t.key ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
              color: tab === t.key ? '#fff' : '#64748b',
              boxShadow: tab === t.key ? '0 4px 12px rgba(79,70,229,0.35)' : 'none' }}
            onClick={() => { setTab(t.key); setStatus(null); stopCamera(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t.icon}
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── MARK ATTENDANCE TAB ── */}
      {tab === 'mark' && (
        <div style={S.grid}>
          <div style={S.card}>
            <h3 style={S.cardTitle}>
              <Camera size={18} weight="duotone" color="#4f46e5" />
              Camera Feed
            </h3>
            <div style={S.videoWrap}>
              <video ref={videoRef} autoPlay playsInline muted style={S.video} />
              <canvas ref={overlayRef} style={{ ...S.canvas, pointerEvents: 'none' }} />
              {!streaming && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.7)', borderRadius: '16px' }}>
                  <Camera size={48} color="rgba(255,255,255,0.4)" />
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '12px' }}>Camera not started</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!streaming
                ? <button style={{ ...S.btn, ...S.btnPrimary }} onClick={startCamera} disabled={!modReady}>
                    <Camera size={18} /> {modReady ? 'Start Camera' : 'Loading AI...'}
                  </button>
                : <>
                    <button style={{ ...S.btn, ...S.btnGreen, flex: 1, marginBottom: 0 }} onClick={markAttendance} disabled={loading}>
                      <CheckCircle size={18} /> {loading ? 'Scanning...' : 'Mark My Attendance'}
                    </button>
                    <button style={{ ...S.btn, ...S.btnGhost, width: 'auto', padding: '0 16px', marginBottom: 0 }} onClick={stopCamera}>
                      <X size={18} />
                    </button>
                  </>
              }
            </div>
            {status && (
              <div style={status.t === 'ok' ? S.statusOk : status.t === 'err' ? S.statusErr : status.t === 'wrn' ? S.statusWrn : S.statusInf}>
                {status.t === 'ok' ? <CheckCircle size={18} /> : status.t === 'err' ? <XCircle size={18} /> : <Warning size={18} />}
                {status.m}
              </div>
            )}
          </div>

          <div style={S.card}>
            <h3 style={S.cardTitle}><SmileyWink size={18} weight="duotone" color="#4f46e5" /> Today's Status</h3>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '20px', marginBottom: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#6d28d9', fontSize: '13px', fontWeight: 600, margin: '0 0 8px' }}>{today}</p>
              {myLog.length > 0 ? (
                <>
                  <CheckCircle size={48} color="#10b981" weight="fill" style={{ marginBottom: '12px' }} />
                  <p style={{ color: '#065f46', fontWeight: 800, fontSize: '16px', margin: '0 0 4px' }}>Present Today</p>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Arrived at {myLog[0]?.time}</p>
                </>
              ) : (
                <>
                  <Clock size={48} color="#f59e0b" weight="duotone" style={{ marginBottom: '12px' }} />
                  <p style={{ color: '#92400e', fontWeight: 800, fontSize: '16px', margin: '0 0 4px' }}>Not Marked Yet</p>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Use camera to mark attendance</p>
                </>
              )}
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 12px', fontWeight: 800, letterSpacing: '0.05em' }}>HOW IT WORKS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  <span style={S.numBadge}>1</span> Click "Start Camera"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  <span style={S.numBadge}>2</span> Look at camera clearly
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  <span style={S.numBadge}>3</span> Click "Mark My Attendance"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  <span style={S.numBadge}>4</span> AI verifies face instantly
                </div>
              </div>
            </div>
            {!isRegistered && (
              <div style={{ ...S.statusWrn, marginTop: '16px' }}>
                <Warning size={18} /> Your face is not registered yet. Go to "Register Face" tab first.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REGISTER FACE TAB ── */}
      {tab === 'register' && (
        <div style={S.grid}>
          <div style={S.card}>
            <h3 style={S.cardTitle}><Camera size={18} weight="duotone" color="#4f46e5" /> Capture Setup</h3>
            <div style={S.videoWrap}>
              <video ref={videoRef} autoPlay playsInline muted style={S.video} />
              {!streaming && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.7)', borderRadius: '16px' }}>
                  <Camera size={48} color="rgba(255,255,255,0.4)" />
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '12px' }}>Camera not started</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!streaming
                ? <button style={{ ...S.btn, ...S.btnPrimary }} onClick={startCamera} disabled={!modReady}>
                    <Camera size={18} /> {modReady ? 'Start Camera' : 'Loading AI...'}
                  </button>
                : <>
                    <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, marginBottom: 0 }} onClick={captureForRegistration} disabled={loading}>
                      <Camera size={18} /> {loading ? 'Processing...' : 'Capture My Face'}
                    </button>
                    <button style={{ ...S.btn, ...S.btnGhost, width: 'auto', padding: '0 16px', marginBottom: 0 }} onClick={stopCamera}>
                      <X size={18} />
                    </button>
                  </>
              }
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.cardTitle}><UserCircle size={18} weight="duotone" color="#4f46e5" /> Registration Status</h3>

            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', marginBottom: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '12px' }}>
                {capturedDescriptor ? (
                  <CheckCircle size={48} color="#10b981" weight="fill" />
                ) : (
                  <Camera size={48} color="#94a3b8" weight="duotone" />
                )}
              </div>
              <p style={{ fontWeight: 700, color: capturedDescriptor ? '#065f46' : '#64748b', margin: '0 0 4px', fontSize: '15px' }}>
                {capturedDescriptor ? 'Face Captured Successfully!' : 'No face captured yet'}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                {capturedDescriptor ? `Ready to register face template` : 'Start camera and capture face template'}
              </p>
            </div>

            <button
              style={{ ...S.btn, ...S.btnGreen, opacity: capturedDescriptor ? 1 : 0.5 }}
              onClick={saveMyFace}
              disabled={!capturedDescriptor || loading}
            >
              <CheckCircle size={18} /> {loading ? 'Saving...' : 'Save My Face'}
            </button>

            <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '14px', border: '1px solid #fde68a' }}>
              <p style={{ color: '#92400e', fontSize: '13px', margin: 0, fontWeight: 600, lineHeight: 1.6 }}>
                <Lightbulb size={18} weight="fill" color="#d97706" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                <strong>Tips for best accuracy:</strong><br/>
                • Ensure good lighting on your face<br/>
                • Remove glasses if possible<br/>
                • Look straight at the camera<br/>
                • Keep background clear
              </p>
            </div>

            {status && (
              <div style={status.t === 'ok' ? S.statusOk : status.t === 'err' ? S.statusErr : S.statusInf}>
                {status.t === 'ok' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {status.m}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div>
          <div style={S.statRow}>
            <div style={S.statCard}>
              <p style={S.statNum}>{myLog.length}</p>
              <p style={S.statLabel}>Total Records</p>
            </div>
            <div style={{ ...S.statCard, background: isRegistered ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${isRegistered ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <div style={{ marginBottom: '6px' }}>
                {isRegistered ? (
                  <CheckCircle size={32} color="#10b981" weight="fill" />
                ) : (
                  <XCircle size={32} color="#ef4444" weight="fill" />
                )}
              </div>
              <p style={S.statLabel}>Face Registered</p>
            </div>
            <div style={S.statCard}>
              <p style={S.statNum}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
              <p style={S.statLabel}>Today</p>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ ...S.cardTitle, margin: 0 }}>📋 My Face Attendance History</h3>
              <button style={{ ...S.btn, width: 'auto', padding: '8px 16px', ...S.btnGhost, marginBottom: 0 }} onClick={fetchMyLog}>
                <ArrowClockwise size={16} /> Refresh
              </button>
            </div>
            {myLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FileText size={48} color="#94a3b8" weight="duotone" style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 4px', color: '#475569' }}>No attendance history found</p>
                <p style={{ fontSize: '14px', margin: 0 }}>Go to Mark Attendance and scan your face</p>
              </div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Date</th>
                    <th style={S.th}>Time In</th>
                    <th style={S.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLog.map((row, i) => (
                    <tr key={i}>
                      <td style={{ ...S.td, fontWeight: 700, color: '#0f172a' }}>
                        {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={S.td}>{row.time}</td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, background: 'rgba(16,185,129,0.1)', color: '#065f46' }}>
                          <CheckCircle size={14} weight="bold" /> Present
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
