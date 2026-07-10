import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import API_BASE_URL from '../config/api';

const MODELS_PATH = '/models';

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', padding:'32px', fontFamily:"'Inter',sans-serif" },
  headerTitle: { fontSize:'28px', fontWeight:800, color:'#fff', margin:'0 0 6px 0', display:'flex', alignItems:'center', gap:'12px' },
  headerSub: { color:'#94a3b8', fontSize:'14px', margin:'0 0 28px 0' },
  badge: { display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px', background:'rgba(99,102,241,0.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)' },
  tabs: { display:'flex', gap:'8px', marginBottom:'28px', background:'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'6px', width:'fit-content' },
  tab: { padding:'10px 24px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:600, transition:'all 0.2s ease' },
  tabA: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', boxShadow:'0 4px 15px rgba(99,102,241,0.4)' },
  tabI: { background:'transparent', color:'#94a3b8' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' },
  card: { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.1)', padding:'28px' },
  cardTitle: { fontSize:'16px', fontWeight:700, color:'#e2e8f0', margin:'0 0 20px 0', display:'flex', alignItems:'center', gap:'8px' },
  video: { width:'100%', borderRadius:'16px', background:'#000', minHeight:'260px', border:'2px solid rgba(99,102,241,0.3)', display:'block' },
  canvas: { position:'absolute', top:0, left:0, borderRadius:'16px' },
  videoWrap: { position:'relative', marginBottom:'14px' },
  input: { width:'100%', padding:'12px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'14px', transition:'border 0.2s' },
  select: { width:'100%', padding:'12px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(30,27,75,0.95)', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'14px', cursor:'pointer' },
  btn: { width:'100%', padding:'13px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, transition:'all 0.2s ease', marginBottom:'10px' },
  btnP: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', boxShadow:'0 4px 15px rgba(99,102,241,0.35)' },
  btnS: { background:'rgba(255,255,255,0.08)', color:'#e2e8f0', border:'1px solid rgba(255,255,255,0.1)' },
  btnG: { background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', boxShadow:'0 4px 15px rgba(16,185,129,0.35)' },
  btnR: { background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff' },
  statusOk:  { marginTop:'12px', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:600, textAlign:'center', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7' },
  statusErr: { marginTop:'12px', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:600, textAlign:'center', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5' },
  statusWrn: { marginTop:'12px', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:600, textAlign:'center', background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'#fde68a' },
  statusInf: { marginTop:'12px', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:600, textAlign:'center', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#a5b4fc' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'10px 14px', textAlign:'left', color:'#64748b', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  td: { padding:'12px 14px', color:'#e2e8f0', fontSize:'14px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  loadBar: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px', gap:'16px' },
  spinner: { width:'48px', height:'48px', border:'4px solid rgba(99,102,241,0.3)', borderTop:'4px solid #6366f1', borderRadius:'50%', animation:'spin 1s linear infinite' },
  liveDot: { width:8, height:8, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse 1s infinite', marginRight:6 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const authHeader = () => ({ 'Content-Type':'application/json', Authorization:`Bearer ${sessionStorage.getItem('token')}` });

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

// ── Load Models ───────────────────────────────────────────────────────────────
let modelsLoaded = false;
async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH);
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH);
  modelsLoaded = true;
}

// ── Register Tab ──────────────────────────────────────────────────────────────
function RegisterTab() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [modReady, setModReady] = useState(false);
  const [captured, setCaptured] = useState(null); // descriptor Float32Array

  useEffect(() => {
    loadModels().then(() => setModReady(true));
    fetch(`${API_BASE_URL}/api/face-attendance/students`, { headers: authHeader() })
      .then(r => r.json()).then(d => setStudents(d.students || []));
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch {
      setStatus({ t:'err', m:'❌ Camera access denied. Please allow camera in browser settings.' });
    }
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  const captureAndEncode = async () => {
    if (!modReady) return setStatus({ t:'inf', m:'⏳ AI models still loading, please wait...' });
    if (!streaming) return setStatus({ t:'err', m:'❌ Start the camera first.' });
    setLoading(true);
    setStatus({ t:'inf', m:'🔍 Detecting face...' });
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setStatus({ t:'err', m:'❌ No face detected. Look directly at the camera in good lighting.' });
      } else {
        setCaptured(detection.descriptor);
        setStatus({ t:'ok', m:'✅ Face captured! Now click "Register Face" to save.' });
      }
    } catch(e) {
      setStatus({ t:'err', m:'❌ Detection error: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  const registerFace = async () => {
    if (!selectedId) return setStatus({ t:'err', m:'❌ Please select a student first.' });
    if (!captured) return setStatus({ t:'err', m:'❌ Please capture the face first.' });
    const stu = students.find(s => s.student_id == selectedId);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/face-attendance/register`, {
        method:'POST',
        headers: authHeader(),
        body: JSON.stringify({ student_id: selectedId, label: stu?.name, descriptor: Array.from(captured) })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ t:'ok', m:`✅ "${stu?.name}" face registered successfully!` });
        setCaptured(null);
        setSelectedId('');
        // Refresh list
        fetch(`${API_BASE_URL}/api/face-attendance/students`, { headers: authHeader() })
          .then(r => r.json()).then(d => setStudents(d.students || []));
      } else {
        setStatus({ t:'err', m:'❌ ' + data.message });
      }
    } catch {
      setStatus({ t:'err', m:'❌ Server error. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.grid}>
      <div style={S.card}>
        <h3 style={S.cardTitle}>📷 Camera</h3>
        <div style={S.videoWrap}>
          <video ref={videoRef} autoPlay playsInline muted style={S.video} />
          <canvas ref={canvasRef} style={{ ...S.canvas, display:'none' }} />
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          {!streaming
            ? <button style={{ ...S.btn, ...S.btnP }} onClick={startCamera} disabled={!modReady}>
                {modReady ? '▶ Start Camera' : '⏳ Loading AI...'}
              </button>
            : <>
                <button style={{ ...S.btn, ...S.btnG, flex:1, marginBottom:0 }} onClick={captureAndEncode} disabled={loading}>
                  {loading ? '⏳ Processing...' : '📸 Capture Face'}
                </button>
                <button style={{ ...S.btn, ...S.btnS, flex:1, marginBottom:0 }} onClick={stopCamera}>⏹ Stop</button>
              </>
          }
        </div>
        {captured && (
          <div style={{ marginTop:'12px', padding:'12px', borderRadius:'12px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7', fontSize:'13px', textAlign:'center' }}>
            🟢 Face encoding ready ({captured.length} dimensions)
          </div>
        )}
      </div>

      <div style={S.card}>
        <h3 style={S.cardTitle}>👤 Select Student</h3>
        <select style={S.select} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">-- Select Student --</option>
          {students.map(s => (
            <option key={s.student_id} value={s.student_id}>
              {s.name} ({s.roll_number}) {s.is_registered ? '✅' : ''}
            </option>
          ))}
        </select>

        <div style={{ padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', marginBottom:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color:'#94a3b8', fontSize:'13px', margin:0, lineHeight:'1.6' }}>
            <strong style={{ color:'#e2e8f0' }}>Steps:</strong><br/>
            1️⃣ Start Camera<br/>
            2️⃣ Position face clearly<br/>
            3️⃣ Click "Capture Face"<br/>
            4️⃣ Select student from list<br/>
            5️⃣ Click "Register Face"
          </p>
        </div>

        <button style={{ ...S.btn, ...S.btnP }} onClick={registerFace} disabled={loading || !captured || !selectedId}>
          {loading ? '⏳ Registering...' : '✅ Register Face'}
        </button>

        <div style={{ marginTop:'8px' }}>
          <p style={{ color:'#64748b', fontSize:'12px', margin:'8px 0 4px' }}>Registered Students</p>
          <div style={{ maxHeight:'200px', overflowY:'auto' }}>
            {students.filter(s => s.is_registered).map(s => (
              <div key={s.student_id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'rgba(16,185,129,0.08)', borderRadius:'8px', marginBottom:'6px' }}>
                <span style={{ color:'#e2e8f0', fontSize:'13px' }}>{s.name}</span>
                <span style={{ color:'#64748b', fontSize:'12px' }}>{s.roll_number}</span>
              </div>
            ))}
            {students.filter(s => s.is_registered).length === 0 && (
              <p style={{ color:'#475569', fontSize:'13px', textAlign:'center' }}>No students registered yet</p>
            )}
          </div>
        </div>

        {status && <div style={status.t==='ok'?S.statusOk:status.t==='err'?S.statusErr:status.t==='wrn'?S.statusWrn:S.statusInf}>{status.m}</div>}
      </div>
    </div>
  );
}

// ── Attendance Tab ────────────────────────────────────────────────────────────
function AttendanceTab() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const autoRef = useRef(null);
  const [knownDescriptors, setKnownDescriptors] = useState([]);
  const [status, setStatus] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [log, setLog] = useState([]);
  const [modReady, setModReady] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchLog = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/face-attendance/today`, { headers: authHeader() });
    const d = await res.json();
    setLog(d.attendance || []);
  }, []);

  const fetchDescriptors = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/face-attendance/descriptors`, { headers: authHeader() });
    const d = await res.json();
    setKnownDescriptors(d.descriptors || []);
  }, []);

  useEffect(() => {
    loadModels().then(() => setModReady(true));
    fetchLog();
    fetchDescriptors();
    return () => { stopCamera(); clearInterval(autoRef.current); };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoRef.current.srcObject = stream;
      await new Promise(r => videoRef.current.onloadedmetadata = r);
      if (overlayRef.current) {
        overlayRef.current.width = videoRef.current.videoWidth;
        overlayRef.current.height = videoRef.current.videoHeight;
      }
      setStreaming(true);
    } catch {
      setStatus({ t:'err', m:'❌ Camera access denied.' });
    }
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    clearInterval(autoRef.current);
    setStreaming(false);
    setAutoMode(false);
  };

  const recognize = useCallback(async () => {
    if (!modReady || !streaming || scanning) return;
    if (knownDescriptors.length === 0) {
      setStatus({ t:'wrn', m:'⚠️ No registered students. Go to Register tab first.' });
      return;
    }
    setScanning(true);
    try {
      // Use detectAllFaces to catch 2 or 3 students at once
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections || detections.length === 0) {
        setStatus({ t:'err', m:'🔍 No face detected. Look at camera clearly.' });
        if (overlayRef.current) {
          overlayRef.current.getContext('2d').clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        }
        setScanning(false);
        return;
      }

      let ctx;
      let resizedDetections = detections;
      if (overlayRef.current) {
        ctx = overlayRef.current.getContext('2d');
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        // Match display size
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        resizedDetections = faceapi.resizeResults(detections, displaySize);
      }

      const THRESHOLD = 0.55;
      let markedNames = [];
      let unknownCount = 0;
      let alreadyMarkedCount = 0;

      for (const detection of resizedDetections) {
        let bestMatch = null;
        let bestDist = Infinity;
        for (const known of knownDescriptors) {
          const dist = euclideanDistance(Array.from(detection.descriptor), known.descriptor);
          if (dist < bestDist) { bestDist = dist; bestMatch = known; }
        }

        const box = detection.detection.box;

        if (bestDist <= THRESHOLD && bestMatch) {
          if (ctx) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            ctx.fillStyle = '#10b981';
            ctx.fillRect(box.x, box.y - 28, Math.max(box.width, 100), 28);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(bestMatch.student_name, box.x + 5, box.y - 8);
          }

          // API call to mark attendance
          const res = await fetch(`${API_BASE_URL}/api/face-attendance/mark`, {
            method:'POST',
            headers: authHeader(),
            body: JSON.stringify({ student_id: bestMatch.student_id })
          });
          const data = await res.json();
          if (data.status === 'already_marked') {
            alreadyMarkedCount++;
          } else {
            markedNames.push(bestMatch.student_name);
          }
        } else {
          unknownCount++;
          if (ctx) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(box.x, box.y - 28, Math.max(box.width, 180), 28);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Unknown / Not Registered', box.x + 5, box.y - 8);
          }
        }
      }

      // Final status message
      let msgs = [];
      if (markedNames.length > 0) {
        msgs.push(`✅ Marked: ${markedNames.join(', ')}`);
        fetchLog();
      }
      if (alreadyMarkedCount > 0) msgs.push(`⚠️ ${alreadyMarkedCount} already marked`);
      if (unknownCount > 0) msgs.push(`❌ ${unknownCount} Unknown face(s)`);

      if (msgs.length > 0) {
        const type = markedNames.length > 0 ? 'ok' : (unknownCount > 0 ? 'err' : 'wrn');
        setStatus({ t: type, m: msgs.join(' | ') });
      }

    } catch(e) {
      setStatus({ t:'err', m:'❌ Recognition error: ' + e.message });
    } finally {
      setScanning(false);
    }
  }, [modReady, streaming, scanning, knownDescriptors, fetchLog]);

  const toggleAuto = async () => {
    if (!autoMode) {
      if (!streaming) await startCamera();
      setAutoMode(true);
      autoRef.current = setInterval(() => recognize(), 3000);
    } else {
      clearInterval(autoRef.current);
      setAutoMode(false);
    }
  };

  return (
    <div>
      <div style={S.grid}>
        <div style={S.card}>
          <h3 style={S.cardTitle}>
            📸 Live Scanner
            {autoMode && <span style={{ fontSize:'12px', color:'#10b981', fontWeight:700 }}><span style={S.liveDot}></span>AUTO</span>}
          </h3>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', marginBottom:'14px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color:'#94a3b8', fontSize:'13px', fontWeight:600 }}>🤖 Auto-scan every 3 seconds</span>
            <button
              style={{ ...S.btn, width:'auto', padding:'6px 16px', marginBottom:0, ...(autoMode ? S.btnG : S.btnS) }}
              onClick={toggleAuto}
            >
              {autoMode ? '⏹ Stop' : '▶ Start Auto'}
            </button>
          </div>

          <div style={S.videoWrap}>
            <video ref={videoRef} autoPlay playsInline muted style={S.video} />
            <canvas ref={overlayRef} style={{ ...S.canvas, pointerEvents:'none' }} />
          </div>

          <div style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
            {!streaming
              ? <button style={{ ...S.btn, ...S.btnP, marginBottom:0 }} onClick={startCamera} disabled={!modReady}>
                  {modReady ? '▶ Start Camera' : '⏳ Loading AI...'}
                </button>
              : <>
                  <button style={{ ...S.btn, ...S.btnG, flex:1, marginBottom:0 }} onClick={recognize} disabled={scanning}>
                    {scanning ? '🔍 Scanning...' : '📷 Scan Now'}
                  </button>
                  <button style={{ ...S.btn, ...S.btnR, flex:1, marginBottom:0 }} onClick={stopCamera}>⏹ Stop</button>
                </>
            }
          </div>

          <button style={{ ...S.btn, ...S.btnS }} onClick={() => { fetchDescriptors(); fetchLog(); }}>
            🔄 Refresh Data ({knownDescriptors.length} faces registered)
          </button>
        </div>

        <div style={S.card}>
          <h3 style={S.cardTitle}>🎯 Recognition Status</h3>

          {!modReady && (
            <div style={S.loadBar}>
              <div style={S.spinner}></div>
              <p style={{ color:'#94a3b8', fontSize:'14px' }}>Loading AI models...</p>
            </div>
          )}

          {modReady && (
            <div style={{ padding:'20px', background:'rgba(16,185,129,0.08)', borderRadius:'16px', border:'1px solid rgba(16,185,129,0.2)', marginBottom:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'32px', marginBottom:'8px' }}>🤖</div>
              <p style={{ color:'#6ee7b7', fontWeight:700, margin:0, fontSize:'15px' }}>AI Ready</p>
              <p style={{ color:'#94a3b8', fontSize:'13px', margin:'4px 0 0' }}>face-api.js models loaded</p>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            <div style={{ padding:'16px', background:'rgba(99,102,241,0.1)', borderRadius:'12px', border:'1px solid rgba(99,102,241,0.2)', textAlign:'center' }}>
              <div style={{ fontSize:'28px', fontWeight:800, color:'#a5b4fc' }}>{log.length}</div>
              <div style={{ color:'#64748b', fontSize:'12px', fontWeight:600 }}>Present Today</div>
            </div>
            <div style={{ padding:'16px', background:'rgba(139,92,246,0.1)', borderRadius:'12px', border:'1px solid rgba(139,92,246,0.2)', textAlign:'center' }}>
              <div style={{ fontSize:'28px', fontWeight:800, color:'#c4b5fd' }}>{knownDescriptors.length}</div>
              <div style={{ color:'#64748b', fontSize:'12px', fontWeight:600 }}>Registered</div>
            </div>
          </div>

          {status && (
            <div style={status.t==='ok'?S.statusOk:status.t==='err'?S.statusErr:status.t==='wrn'?S.statusWrn:S.statusInf}>
              {status.m}
            </div>
          )}

          <div style={{ marginTop:'16px', padding:'14px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color:'#94a3b8', fontSize:'13px', margin:0, lineHeight:'1.6' }}>
              💡 <strong style={{ color:'#e2e8f0' }}>Tips:</strong><br/>
              • Good lighting improves accuracy<br/>
              • Look straight at camera<br/>
              • One face at a time works best
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Log */}
      <div style={{ ...S.card, marginTop:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h3 style={{ ...S.cardTitle, margin:0 }}>📋 Today's Attendance Log</h3>
          <button style={{ ...S.btn, width:'auto', padding:'8px 16px', marginBottom:0, ...S.btnS }} onClick={fetchLog}>🔄 Refresh</button>
        </div>
        {log.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📭</div>
            <p style={{ fontWeight:600 }}>No attendance recorded yet today.</p>
            <p style={{ fontSize:'13px', marginTop:'4px' }}>Start the scanner and capture student faces.</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Student Name</th>
                  <th style={S.th}>Roll Number</th>
                  <th style={S.th}>Time In</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {log.map((row, i) => (
                  <tr key={row.id}>
                    <td style={S.td}>{i+1}</td>
                    <td style={{ ...S.td, fontWeight:700, color:'#a5b4fc' }}>{row.student_name}</td>
                    <td style={S.td}>{row.roll_number}</td>
                    <td style={S.td}>{row.time}</td>
                    <td style={S.td}>
                      <span style={{ background:'rgba(16,185,129,0.15)', color:'#6ee7b7', padding:'3px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:700 }}>✅ Present</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FaceAttendancePage() {
  const [tab, setTab] = useState('attendance');
  const [regCount, setRegCount] = useState('...');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/face-attendance/descriptors`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setRegCount(d.descriptors?.length ?? '?'))
      .catch(() => setRegCount('?'));
  }, [tab]);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        button:not(:disabled):hover { opacity:0.88; transform:translateY(-1px); }
        select option { background:#1e1b4b; }
      `}</style>

      <h1 style={S.headerTitle}>
        🧑‍💻 Smart Face Attendance
        <span style={S.badge}>👥 {regCount} Registered</span>
      </h1>
      <p style={S.headerSub}>Browser-based AI face recognition — no Python, no external server required</p>

      <div style={S.tabs}>
        <button style={{ ...S.tab, ...(tab==='attendance'?S.tabA:S.tabI) }} onClick={() => setTab('attendance')}>📸 Mark Attendance</button>
        <button style={{ ...S.tab, ...(tab==='register'?S.tabA:S.tabI) }} onClick={() => setTab('register')}>➕ Register Student Face</button>
      </div>

      {tab === 'attendance' ? <AttendanceTab /> : <RegisterTab />}
    </div>
  );
}
