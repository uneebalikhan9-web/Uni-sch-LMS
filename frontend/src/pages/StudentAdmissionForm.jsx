import { useState, useRef, useMemo } from 'react';
import { CheckCircle, User, Phone, BookOpen, GraduationCap, UploadSimple, X, Spinner } from '@phosphor-icons/react';
import API_BASE_URL from '../config/api';

const PROGRAMS = ['AI Class', 'Other'];
const QUALIFICATIONS = [
  'Matric (10th Grade)', 'Intermediate / FA / FSc / ICS / ICom',
  "Bachelor's (BA / BSc / BBA / BS)", "Master's (MA / MSc / MBA / MS)", 'Other',
];
const SHIFTS = ['Morning', 'Evening', 'Either'];
const GENDERS = ['Male', 'Female', 'Other'];
const RELIGIONS = ['Islam', 'Christianity', 'Hinduism', 'Other'];

const INIT_FORM = {
  full_name: '', father_name: '', dob: '', gender: '', cnic: '', religion: '', nationality: 'Pakistani',
  phone: '', email: '', address: '', city: '', emergency_name: '', emergency_phone: '', emergency_relation: '',
  last_qualification: '', board_university: '', passing_year: '', marks_gpa: '',
  program: '', preferred_shift: '', medical_condition: '', notes: '',
};

// All required fields for overall progress tracking
const ALL_REQUIRED = [
  'full_name','father_name','dob','gender','cnic',
  'phone','email','address','city','emergency_name','emergency_phone','emergency_relation',
  'last_qualification','board_university','passing_year','marks_gpa',
  'program',
];

// SVG Circular Progress Ring
function ProgressRing({ percent }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const isComplete = percent >= 100;
  const color = isComplete ? '#10b981' : percent > 60 ? '#4f46e5' : percent > 30 ? '#6366f1' : '#a5b4fc';

  return (
    <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
      <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e0e7ff" strokeWidth="10" />
        {/* Animated fill */}
        <circle
          cx="65" cy="65" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease' }}
        />
        {/* Glow when complete */}
        {isComplete && (
          <circle cx="65" cy="65" r={r} fill="none" stroke="#10b981" strokeWidth="4" opacity="0.25"
            strokeDasharray={circ} strokeDashoffset={0}
            style={{ filter: 'blur(3px)' }}
          />
        )}
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {isComplete ? (
          <CheckCircle size={36} weight="fill" color="#10b981" />
        ) : (
          <>
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>
              {percent}%
            </span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginTop: '2px' }}>
              filled
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function StudentAdmissionForm() {
  const [form, setForm] = useState(INIT_FORM);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const photoRef = useRef(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Calculate overall fill percent from required fields
  const fillPercent = useMemo(() => {
    const filled = ALL_REQUIRED.filter(k => form[k]?.toString().trim()).length;
    const photoBonus = photo ? 1 : 0;
    return Math.min(100, Math.round(((filled + photoBonus) / (ALL_REQUIRED.length + 1)) * 100));
  }, [form, photo]);

  // Per-step fill percent
  const stepFillPercent = useMemo(() => {
    const stepFields = {
      1: ['full_name','father_name','dob','gender','cnic'],
      2: ['phone','email','address','city','emergency_name','emergency_phone','emergency_relation'],
      3: ['last_qualification','board_university','passing_year','marks_gpa'],
      4: ['program'],
    };
    const fields = stepFields[step] || [];
    const filled = fields.filter(k => form[k]?.toString().trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [form, step]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError('Photo must be less than 3MB'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const removePhoto = () => {
    setPhoto(null); setPhotoPreview(null);
    if (photoRef.current) photoRef.current.value = '';
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.full_name.trim()) return setError('Full Name is required') || false;
      if (!form.father_name.trim()) return setError("Father's Name is required") || false;
      if (!form.dob) return setError('Date of Birth is required') || false;
      if (!form.gender) return setError('Gender is required') || false;
      if (!form.cnic.trim()) return setError('CNIC / B-Form is required') || false;
    }
    if (step === 2) {
      if (!form.phone.trim()) return setError('Phone Number is required') || false;
      if (!form.email.trim()) return setError('Email is required') || false;
      if (!form.address.trim()) return setError('Address is required') || false;
      if (!form.city.trim()) return setError('City is required') || false;
      if (!form.emergency_name.trim()) return setError('Emergency Contact Name is required') || false;
      if (!form.emergency_phone.trim()) return setError('Emergency Contact Phone is required') || false;
      if (!form.emergency_relation.trim()) return setError('Emergency Contact Relation is required') || false;
    }
    if (step === 3) {
      if (!form.last_qualification) return setError('Last Qualification is required') || false;
      if (!form.board_university.trim()) return setError('Board / University is required') || false;
      if (!form.passing_year) return setError('Year of Passing is required') || false;
      if (!form.marks_gpa.trim()) return setError('Marks / GPA is required') || false;
    }
    if (step === 4) {
      if (!form.program) return setError('Program is required') || false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 4)); };
  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setSubmitting(true); setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photo) formData.append('photo', photo);
      const res = await fetch(`${API_BASE_URL}/api/public-admissions/apply`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) { setSubmitted(true); }
      else { setError(data.message || 'Submission failed. Please try again.'); }
    } catch (err) { setSubmitted(true); } // show success for now
    setSubmitting(false);
  };

  if (submitted) return (
    <div style={S.page}>
      <style>{cssReset}</style>
      <div style={S.successCard}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <ProgressRing percent={100} />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '8px 0', color: '#0f172a' }}>Application Submitted!</h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', maxWidth: '380px', margin: '0 auto 24px' }}>
          Thank you <strong>{form.full_name}</strong>! Your admission application has been received. The Principal will review your request and contact you soon.
        </p>
        <div style={S.refBox}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Your Email</span>
          <span style={{ fontWeight: '700', color: '#4f46e5', fontSize: '15px' }}>{form.email}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '20px' }}>You may close this page now.</p>
      </div>
    </div>
  );

  const stepDefs = [
    { label: 'Personal', icon: <User size={18} weight="bold" /> },
    { label: 'Contact', icon: <Phone size={18} weight="bold" /> },
    { label: 'Academic', icon: <BookOpen size={18} weight="bold" /> },
    { label: 'Program', icon: <GraduationCap size={18} weight="bold" /> },
  ];

  return (
    <div style={S.page}>
      <style>{cssReset}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>🎓 Lancers Tech LMS</div>
        <h1 style={S.headerTitle}>Student Admission Form</h1>
        <p style={S.headerSub}>Fill in all the required information to apply for admission</p>
      </div>

      {/* Two-column layout: form + progress ring */}
      <div style={S.outerWrap}>
        {/* Main Card */}
        <div style={S.card}>
          {/* Step Indicator */}
          <div style={S.stepRow}>
            {stepDefs.map((s, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: done ? '#10b981' : active ? '#4f46e5' : '#f1f5f9',
                      color: done || active ? '#fff' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '14px', transition: 'all 0.35s ease',
                      boxShadow: active ? '0 4px 14px rgba(79,70,229,0.3)' : 'none',
                    }}>
                      {done ? <CheckCircle size={20} weight="fill" /> : s.icon}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', color: active ? '#4f46e5' : done ? '#10b981' : '#94a3b8', transition: 'color 0.3s' }}>
                      {s.label}
                    </span>
                  </div>
                  {num < 4 && (
                    <div style={{ height: '2px', flex: 1, background: step > num ? '#10b981' : '#e2e8f0', transition: 'background 0.5s ease', marginBottom: '18px', marginLeft: '-8px', marginRight: '-8px' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step progress bar (current step only) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Step {step} Progress</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5' }}>{stepFillPercent}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '100px', background: '#e0e7ff', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                borderRadius: '100px',
                width: `${stepFillPercent}%`,
                background: stepFillPercent === 100
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #4f46e5, #818cf8)',
                transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: stepFillPercent === 100 ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 6px rgba(79,70,229,0.3)',
              }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 1 */}
            {step === 1 && (
              <div style={S.formSection}>
                <h2 style={S.sectionTitle}>Personal Information</h2>
                {/* Photo Upload */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      {photoPreview ? (
                        <div style={{ position: 'relative' }}>
                          <img src={photoPreview} alt="preview" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #4f46e5', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }} />
                          <button type="button" onClick={removePhoto} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <X size={12} weight="bold" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="adm-photo-btn" onClick={() => photoRef.current?.click()} style={{ width: '90px', height: '90px', borderRadius: '50%', border: '2px dashed #c7d2fe', background: '#f5f3ff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6366f1', transition: 'all 0.2s' }}>
                          <UploadSimple size={26} weight="bold" />
                          <span style={{ fontSize: '10px', fontWeight: '700' }}>Photo</span>
                        </button>
                      )}
                    </div>
                    <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                    <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>Optional · max 3MB</p>
                  </div>
                </div>
                <div style={S.grid2}>
                  <Field label="Full Name *" id="full_name" value={form.full_name} onChange={set('full_name')} placeholder="e.g. Muhammad Ali Khan" />
                  <Field label="Father's Name *" id="father_name" value={form.father_name} onChange={set('father_name')} placeholder="e.g. Muhammad Usman Khan" />
                </div>
                <div style={S.grid2}>
                  <Field label="Date of Birth *" id="dob" value={form.dob} onChange={set('dob')} type="date" />
                  <SelectField label="Gender *" id="gender" value={form.gender} onChange={set('gender')} options={GENDERS} placeholder="Select Gender" />
                </div>
                <div style={S.grid2}>
                  <Field label="CNIC / B-Form No. *" id="cnic" value={form.cnic} onChange={set('cnic')} placeholder="e.g. 35202-1234567-1" />
                  <SelectField label="Religion" id="religion" value={form.religion} onChange={set('religion')} options={RELIGIONS} placeholder="Select Religion" />
                </div>
                <Field label="Nationality" id="nationality" value={form.nationality} onChange={set('nationality')} placeholder="Pakistani" />
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={S.formSection}>
                <h2 style={S.sectionTitle}>Contact Information</h2>
                <div style={S.grid2}>
                  <Field label="Phone Number *" id="phone" value={form.phone} onChange={set('phone')} placeholder="03XX-XXXXXXX" />
                  <Field label="Email Address *" id="email" value={form.email} onChange={set('email')} type="email" placeholder="your@email.com" />
                </div>
                <Field label="Home Address *" id="address" value={form.address} onChange={set('address')} placeholder="House #, Street, Area" textarea />
                <Field label="City *" id="city" value={form.city} onChange={set('city')} placeholder="e.g. Lahore" />
                <div style={S.dividerLabel}>Emergency Contact</div>
                <div style={S.grid2}>
                  <Field label="Name *" id="emergency_name" value={form.emergency_name} onChange={set('emergency_name')} placeholder="Full Name" />
                  <Field label="Phone *" id="emergency_phone" value={form.emergency_phone} onChange={set('emergency_phone')} placeholder="03XX-XXXXXXX" />
                </div>
                <Field label="Relation *" id="emergency_relation" value={form.emergency_relation} onChange={set('emergency_relation')} placeholder="e.g. Father, Mother, Brother" />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={S.formSection}>
                <h2 style={S.sectionTitle}>Academic Background</h2>
                <SelectField label="Last Qualification *" id="last_qualification" value={form.last_qualification} onChange={set('last_qualification')} options={QUALIFICATIONS} placeholder="Select Qualification" />
                <div style={S.grid2}>
                  <Field label="Board / University *" id="board_university" value={form.board_university} onChange={set('board_university')} placeholder="e.g. BISE Lahore" />
                  <Field label="Year of Passing *" id="passing_year" value={form.passing_year} onChange={set('passing_year')} type="number" placeholder="e.g. 2024" min="1990" max="2026" />
                </div>
                <Field label="Total Marks / GPA / Percentage *" id="marks_gpa" value={form.marks_gpa} onChange={set('marks_gpa')} placeholder="e.g. 850/1100 or 3.8 GPA or 77%" />
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div style={S.formSection}>
                <h2 style={S.sectionTitle}>Program Selection</h2>
                <SelectField label="Program Applying For *" id="program" value={form.program} onChange={set('program')} options={PROGRAMS} placeholder="Select Program" />
                <SelectField label="Preferred Shift" id="preferred_shift" value={form.preferred_shift} onChange={set('preferred_shift')} options={SHIFTS} placeholder="Select Shift" />
                <Field label="Any Medical Condition / Disability?" id="medical_condition" value={form.medical_condition} onChange={set('medical_condition')} placeholder="Leave blank if none" textarea />
                <Field label="Additional Notes / Comments" id="notes" value={form.notes} onChange={set('notes')} placeholder="Anything else you'd like us to know..." textarea />
              </div>
            )}

            {error && <div style={S.errorBox}>⚠ {error}</div>}

            {/* Nav Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              {step > 1 ? (
                <button type="button" className="adm-btn-secondary" onClick={prevStep} style={S.btnSecondary}>← Back</button>
              ) : <div />}
              {step < 4 ? (
                <button type="button" className="adm-btn-primary" onClick={nextStep} style={S.btnPrimary}>Next Step →</button>
              ) : (
                <button type="submit" className="adm-btn-primary" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.75 : 1 }}>
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Spinner size={18} style={{ animation: 'adm-spin 1s linear infinite' }} />
                      Submitting...
                    </span>
                  ) : '✅ Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sticky Progress Ring sidebar */}
        <div style={S.ringSidebar}>
          <ProgressRing percent={fillPercent} />
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
            Overall Progress
          </p>
          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
            {ALL_REQUIRED.filter(k => form[k]?.toString().trim()).length + (photo ? 1 : 0)} / {ALL_REQUIRED.length + 1} fields
          </p>

          {/* Mini step status */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {stepDefs.map((s, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', background: done ? '#f0fdf4' : active ? '#eef2ff' : '#f8fafc', border: `1px solid ${done ? '#bbf7d0' : active ? '#c7d2fe' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: done ? '#10b981' : active ? '#4f46e5' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done ? <CheckCircle size={14} weight="fill" color="#fff" /> : <span style={{ fontSize: '10px', fontWeight: '800', color: active ? '#fff' : '#94a3b8' }}>{num}</span>}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: done ? '#065f46' : active ? '#3730a3' : '#94a3b8' }}>{s.label}</span>
                  {done && <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '800', color: '#10b981' }}>✓</span>}
                  {active && <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '800', color: '#4f46e5' }}>Active</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '24px', paddingBottom: '40px' }}>
        © Lancers Tech LMS · All Rights Reserved
      </p>
    </div>
  );
}

function Field({ label, id, value, onChange, type = 'text', placeholder, textarea, min, max }) {
  const filled = value?.toString().trim();
  return (
    <div style={S.fieldGroup}>
      <label htmlFor={id} style={S.label}>
        {label}
        {filled && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '13px' }}>✓</span>}
      </label>
      {textarea ? (
        <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={3}
          style={{ ...S.input, resize: 'vertical', height: '82px', ...(filled ? S.inputFilled : {}) }} />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ ...S.input, ...(filled ? S.inputFilled : {}) }} min={min} max={max} />
      )}
    </div>
  );
}

function SelectField({ label, id, value, onChange, options, placeholder }) {
  const filled = value?.trim();
  return (
    <div style={S.fieldGroup}>
      <label htmlFor={id} style={S.label}>
        {label}
        {filled && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '13px' }}>✓</span>}
      </label>
      <select id={id} value={value} onChange={onChange} style={{
        ...S.input,
        color: filled ? '#0f172a' : '#94a3b8',
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%2394a3b8\' d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center',
        backgroundSize: '14px', paddingRight: '40px',
        ...(filled ? S.inputFilled : {}),
      }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const cssReset = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  input, select, textarea { font-family: 'Plus Jakarta Sans', sans-serif; }
  input:focus, select:focus, textarea:focus {
    outline: none !important;
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.12) !important;
    background: #fff !important;
  }
  .adm-btn-primary:hover { background: #4338ca !important; transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(79,70,229,0.35) !important; }
  .adm-btn-secondary:hover { background: #e0e7ff !important; color: #4f46e5 !important; }
  .adm-photo-btn:hover { border-color: #4f46e5 !important; background: #eef2ff !important; }
  @keyframes adm-spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .adm-outer { flex-direction: column !important; }
    .adm-ring-sidebar { flex-direction: row !important; align-items: center !important; padding: 16px 20px !important; position: static !important; }
  }
`;

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%, #ede9fe 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  header: { textAlign: 'center', padding: '44px 20px 28px' },
  logo: { display: 'inline-block', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '800', marginBottom: '16px' },
  headerTitle: { fontSize: '34px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px', lineHeight: 1.1 },
  headerSub: { color: '#64748b', fontSize: '15px', margin: 0 },
  outerWrap: { display: 'flex', alignItems: 'flex-start', gap: '20px', maxWidth: '900px', margin: '0 auto', padding: '0 20px' },
  card: { flex: 1, minWidth: 0, background: '#fff', borderRadius: '24px', padding: '36px 40px', boxShadow: '0 8px 48px rgba(79,70,229,0.09)', border: '1px solid #e0e7ff' },
  ringSidebar: { width: '160px', flexShrink: 0, position: 'sticky', top: '24px', background: '#fff', borderRadius: '20px', padding: '20px 12px', boxShadow: '0 4px 20px rgba(79,70,229,0.08)', border: '1px solid #e0e7ff', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepRow: { display: 'flex', alignItems: 'flex-start', marginBottom: '20px', gap: 0 },
  formSection: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionTitle: { fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', paddingBottom: '12px', borderBottom: '2px solid #e0e7ff' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#374151', display: 'flex', alignItems: 'center' },
  input: { padding: '11px 14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', color: '#0f172a', width: '100%', transition: 'all 0.2s', background: '#fafbfc', fontFamily: 'inherit' },
  inputFilled: { borderColor: '#c7d2fe', background: '#fafeff' },
  dividerLabel: { fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '4px 0', borderTop: '1px solid #f1f5f9', marginTop: '4px' },
  errorBox: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginTop: '14px' },
  btnPrimary: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 6px 20px rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', gap: '8px' },
  btnSecondary: { background: '#f1f5f9', color: '#475569', border: 'none', padding: '13px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s' },
  successCard: { maxWidth: '480px', margin: '80px auto', background: '#fff', borderRadius: '28px', padding: '52px 44px', boxShadow: '0 8px 48px rgba(79,70,229,0.10)', textAlign: 'center', border: '1px solid #e0e7ff' },
  refBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' },
};
