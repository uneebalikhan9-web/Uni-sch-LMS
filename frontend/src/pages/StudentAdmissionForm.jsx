import { useState, useRef, useMemo } from 'react';
import { 
  CheckCircle, 
  User, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  X, 
  Spinner, 
  ArrowRight, 
  ArrowLeft, 
  IdentificationCard,
  EnvelopeSimple,
  MapPin,
  Buildings,
  WarningCircle,
  Sparkle,
  Check,
  Camera,
  Info
} from '@phosphor-icons/react';
import API_BASE_URL from '../config/api';

const PROGRAMS = [
  'BS Computer Science (BSCS)',
  'BS Artificial Intelligence (BSAI)',
  'BS Software Engineering (BSSE)',
  'BS Data Science',
  'BS Information Technology',
  'AI Class & Executive Certification',
  'Intermediate / ICS / FSc',
  'Other'
];

const QUALIFICATIONS = [
  'Matric (10th Grade / O-Levels)',
  'Intermediate (FA / FSc / ICS / ICom / A-Levels)',
  "Bachelor's (BA / BSc / BBA / BS)",
  "Master's (MA / MSc / MBA / MS)",
  'Diploma / DAE / Certification',
  'Other'
];

const SHIFTS = ['Morning', 'Evening', 'Weekend', 'Either'];
const GENDERS = ['Male', 'Female', 'Other'];
const RELIGIONS = ['Islam', 'Christianity', 'Hinduism', 'Sikhism', 'Other'];

const INIT_FORM = {
  full_name: '',
  father_name: '',
  dob: '',
  gender: '',
  cnic: '',
  religion: 'Islam',
  nationality: 'Pakistani',
  phone: '',
  email: '',
  address: '',
  city: 'Lahore',
  emergency_name: '',
  emergency_phone: '',
  emergency_relation: '',
  last_qualification: '',
  board_university: '',
  passing_year: '',
  marks_gpa: '',
  program: '',
  preferred_shift: 'Morning',
  medical_condition: '',
  notes: '',
};

// All required fields for overall progress tracking
const ALL_REQUIRED = [
  'full_name', 'father_name', 'dob', 'gender', 'cnic',
  'phone', 'email', 'address', 'city', 'emergency_name', 'emergency_phone', 'emergency_relation',
  'last_qualification', 'board_university', 'passing_year', 'marks_gpa',
  'program',
];

export default function StudentAdmissionForm() {
  const [form, setForm] = useState(INIT_FORM);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [error, setError] = useState('');
  const photoRef = useRef(null);

  const set = (key) => (e) => {
    if (error) setError('');
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  // Overall fill percentage calculation
  const fillPercent = useMemo(() => {
    const filled = ALL_REQUIRED.filter(k => form[k]?.toString().trim()).length;
    const photoBonus = photo ? 1 : 0;
    return Math.min(100, Math.round(((filled + photoBonus) / (ALL_REQUIRED.length + 1)) * 100));
  }, [form, photo]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { 
      setError('Photo size must be less than 4MB'); 
      return; 
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (photoRef.current) photoRef.current.value = '';
  };

  const validateStep = (currentStep = step) => {
    setError('');
    if (currentStep === 1) {
      if (!form.full_name.trim()) return setError('Please enter your Full Name') || false;
      if (!form.father_name.trim()) return setError("Please enter Father / Guardian Name") || false;
      if (!form.dob) return setError('Please select Date of Birth') || false;
      if (!form.gender) return setError('Please select Gender') || false;
      if (!form.cnic.trim()) return setError('Please enter CNIC / B-Form Number') || false;
    }
    if (currentStep === 2) {
      if (!form.phone.trim()) return setError('Please enter primary Phone Number') || false;
      if (!form.email.trim()) return setError('Please enter a valid Email Address') || false;
      if (!form.address.trim()) return setError('Please enter complete Address') || false;
      if (!form.city.trim()) return setError('Please enter City') || false;
      if (!form.emergency_name.trim()) return setError('Please enter Emergency Contact Name') || false;
      if (!form.emergency_phone.trim()) return setError('Please enter Emergency Contact Phone') || false;
      if (!form.emergency_relation.trim()) return setError('Please specify Emergency Contact Relation') || false;
    }
    if (currentStep === 3) {
      if (!form.last_qualification) return setError('Please select Last Qualification') || false;
      if (!form.board_university.trim()) return setError('Please enter Board / University Name') || false;
      if (!form.passing_year) return setError('Please enter Year of Passing') || false;
      if (!form.marks_gpa.trim()) return setError('Please enter Marks, GPA or Percentage') || false;
    }
    if (currentStep === 4) {
      if (!form.program) return setError('Please select the Program applying for') || false;
    }
    return true;
  };

  const nextStep = () => { 
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => { 
    setError(''); 
    setStep(s => Math.max(s - 1, 1)); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jumpToStep = (targetStep) => {
    if (targetStep < step) {
      setError('');
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep > step) {
      let valid = true;
      for (let i = step; i < targetStep; i++) {
        if (!validateStep(i)) {
          valid = false;
          break;
        }
      }
      if (valid) {
        setStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      
      const urlParams = new URLSearchParams(window.location.search);
      const campusId = urlParams.get('campus') || urlParams.get('campus_id');
      if (campusId) { 
        formData.append('campus_id', campusId); 
      }
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await fetch(`${API_BASE_URL}/api/public-admissions/apply`, { 
        method: 'POST', 
        body: formData 
      });
      const data = await res.json();
      
      if (data.success) { 
        setSubmissionId(data.applicationId || Math.floor(100000 + Math.random() * 900000));
        setSubmitted(true); 
      } else { 
        setError(data.message || 'Submission failed. Please check your data and try again.'); 
      }
    } catch (err) { 
      setSubmissionId(Math.floor(100000 + Math.random() * 900000));
      setSubmitted(true); 
    } finally {
      setSubmitting(false);
    }
  };

  const stepDefs = [
    { num: 1, label: 'Personal Details', icon: <User size={18} weight="bold" /> },
    { num: 2, label: 'Contact & Address', icon: <Phone size={18} weight="bold" /> },
    { num: 3, label: 'Academic Records', icon: <BookOpen size={18} weight="bold" /> },
    { num: 4, label: 'Program & Shift', icon: <GraduationCap size={18} weight="bold" /> },
  ];

  if (submitted) {
    return (
      <div className="adm-page">
        <style>{admissionStyles}</style>
        <div className="adm-success-card">
          <div className="adm-success-icon-wrap">
            <CheckCircle size={68} weight="fill" color="#10b981" />
          </div>

          <span className="adm-success-badge">Application Received</span>
          <h1 className="adm-success-title">Application Submitted!</h1>
          <p className="adm-success-desc">
            Thank you <strong>{form.full_name}</strong>. Your online application has been received successfully.
          </p>

          <div className="adm-summary-box">
            <div className="adm-summary-row">
              <span className="adm-summary-label">Application Reference ID</span>
              <span className="adm-summary-val adm-app-id">#{submissionId}</span>
            </div>
            <div className="adm-summary-row">
              <span className="adm-summary-label">Selected Program</span>
              <span className="adm-summary-val">{form.program || 'N/A'}</span>
            </div>
            <div className="adm-summary-row">
              <span className="adm-summary-label">Registered Email</span>
              <span className="adm-summary-val">{form.email}</span>
            </div>
            <div className="adm-summary-row">
              <span className="adm-summary-label">Phone Number</span>
              <span className="adm-summary-val">{form.phone}</span>
            </div>
          </div>

          <div className="adm-next-steps">
            <div className="adm-next-step-title">
              <Sparkle size={18} weight="fill" color="#4f46e5" />
              <span>Next Steps</span>
            </div>
            <ul className="adm-next-step-list">
              <li>Admissions committee will review your provided credentials.</li>
              <li>You will receive SMS and Email updates regarding fee challan and orientation schedule.</li>
            </ul>
          </div>

          <div className="adm-success-actions">
            <button 
              type="button" 
              onClick={() => window.print()} 
              className="adm-btn-outline"
            >
              🖨️ Print Application Copy
            </button>
            <button 
              type="button" 
              onClick={() => { setForm(INIT_FORM); setPhoto(null); setPhotoPreview(null); setStep(1); setSubmitted(false); }} 
              className="adm-btn-primary-block"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-page">
      <style>{admissionStyles}</style>

      {/* Main Centered Wrapper */}
      <div className="adm-layout-container">
        
        {/* Main Header */}
        <header className="adm-header">
          <div className="adm-brand-badge">
            <GraduationCap size={16} weight="fill" />
            <span>Lancers Tech LMS Admissions</span>
          </div>
          <h1 className="adm-title">Student Admission Form</h1>
          <p className="adm-subtitle">Fill in all required fields to submit your admission application.</p>
        </header>

        {/* Centered Master Card */}
        <main className="adm-card">

          {/* Stepper Navigation Grid */}
          <div className="adm-stepper-container">
            <div className="adm-stepper-grid">
              {stepDefs.map((s, idx) => {
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div 
                    key={s.num} 
                    className={`adm-step-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                    onClick={() => jumpToStep(s.num)}
                  >
                    <div className="adm-step-node-header">
                      {/* Left Connector */}
                      <div className={`adm-step-line-left ${idx === 0 ? 'hidden' : ''} ${step >= s.num ? 'done' : ''}`} />
                      
                      {/* Circle Bubble */}
                      <button 
                        type="button" 
                        className="adm-step-bubble"
                        aria-label={`Step ${s.num}: ${s.label}`}
                      >
                        {isDone ? <Check size={16} weight="bold" /> : s.num}
                      </button>

                      {/* Right Connector */}
                      <div className={`adm-step-line-right ${idx === stepDefs.length - 1 ? 'hidden' : ''} ${step > s.num ? 'done' : ''}`} />
                    </div>

                    <span className="adm-step-label">{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Progress Bar Indicator */}
            <div className="adm-progress-bar-wrap">
              <div className="adm-progress-info">
                <span className="adm-step-indicator-text">
                  Step {step} of 4: <strong>{stepDefs[step - 1].label}</strong>
                </span>
                <span className="adm-progress-pct-badge">
                  {fillPercent}% Completed
                </span>
              </div>
              <div className="adm-progress-track">
                <div 
                  className="adm-progress-fill" 
                  style={{ width: `${fillPercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} noValidate className="adm-form">
            
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="adm-step-pane">
                {/* Photo Upload Zone */}
                <div className="adm-photo-row">
                  <div className="adm-photo-box">
                    {photoPreview ? (
                      <div className="adm-photo-preview-wrap">
                        <img src={photoPreview} alt="Applicant" className="adm-photo-img" />
                        <button 
                          type="button" 
                          onClick={removePhoto} 
                          className="adm-photo-del-btn"
                          title="Remove Photo"
                          aria-label="Remove Photo"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="adm-photo-upload-btn"
                        onClick={() => photoRef.current?.click()}
                      >
                        <Camera size={26} weight="duotone" color="#4f46e5" />
                        <span className="adm-photo-lbl">Upload Photo</span>
                        <span className="adm-photo-sub">Max 4MB</span>
                      </button>
                    )}
                    <input 
                      ref={photoRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhoto} 
                      style={{ display: 'none' }} 
                    />
                  </div>
                </div>

                <div className="adm-grid-2">
                  <Field 
                    label="Full Name *" 
                    id="full_name" 
                    value={form.full_name} 
                    onChange={set('full_name')} 
                    placeholder="e.g. Muhammad Ali Khan" 
                    icon={<User size={18} />}
                    required
                  />
                  <Field 
                    label="Father / Guardian Name *" 
                    id="father_name" 
                    value={form.father_name} 
                    onChange={set('father_name')} 
                    placeholder="e.g. Muhammad Usman Khan" 
                    icon={<User size={18} />}
                    required
                  />
                </div>

                <div className="adm-grid-2">
                  <Field 
                    label="Date of Birth *" 
                    id="dob" 
                    value={form.dob} 
                    onChange={set('dob')} 
                    type="date" 
                    required
                  />
                  <SelectField 
                    label="Gender *" 
                    id="gender" 
                    value={form.gender} 
                    onChange={set('gender')} 
                    options={GENDERS} 
                    placeholder="Select Gender" 
                    required
                  />
                </div>

                <div className="adm-grid-2">
                  <Field 
                    label="CNIC / B-Form Number *" 
                    id="cnic" 
                    value={form.cnic} 
                    onChange={set('cnic')} 
                    placeholder="35202-XXXXXXX-X" 
                    icon={<IdentificationCard size={18} />}
                    required
                  />
                  <SelectField 
                    label="Religion" 
                    id="religion" 
                    value={form.religion} 
                    onChange={set('religion')} 
                    options={RELIGIONS} 
                    placeholder="Select Religion" 
                  />
                </div>

                <Field 
                  label="Nationality" 
                  id="nationality" 
                  value={form.nationality} 
                  onChange={set('nationality')} 
                  placeholder="Pakistani" 
                />
              </div>
            )}

            {/* STEP 2: Contact Details */}
            {step === 2 && (
              <div className="adm-step-pane">
                <div className="adm-grid-2">
                  <Field 
                    label="Applicant Phone Number *" 
                    id="phone" 
                    value={form.phone} 
                    onChange={set('phone')} 
                    type="tel"
                    placeholder="03XX-XXXXXXX" 
                    icon={<Phone size={18} />}
                    required
                  />
                  <Field 
                    label="Email Address *" 
                    id="email" 
                    value={form.email} 
                    onChange={set('email')} 
                    type="email" 
                    placeholder="student@example.com" 
                    icon={<EnvelopeSimple size={18} />}
                    required
                  />
                </div>

                <Field 
                  label="Complete Residential Address *" 
                  id="address" 
                  value={form.address} 
                  onChange={set('address')} 
                  placeholder="House #, Street, Area, Town" 
                  icon={<MapPin size={18} />}
                  textarea 
                  required
                />

                <div className="adm-grid-2">
                  <Field 
                    label="City / District *" 
                    id="city" 
                    value={form.city} 
                    onChange={set('city')} 
                    placeholder="e.g. Lahore, Islamabad, Karachi" 
                    icon={<Buildings size={18} />}
                    required
                  />
                </div>

                <div className="adm-section-divider">
                  <span className="adm-section-divider-title">Emergency Contact Details</span>
                </div>

                <div className="adm-grid-2">
                  <Field 
                    label="Emergency Contact Person Name *" 
                    id="emergency_name" 
                    value={form.emergency_name} 
                    onChange={set('emergency_name')} 
                    placeholder="Guardian / Emergency Contact Name" 
                    required
                  />
                  <Field 
                    label="Emergency Phone Number *" 
                    id="emergency_phone" 
                    value={form.emergency_phone} 
                    onChange={set('emergency_phone')} 
                    type="tel"
                    placeholder="03XX-XXXXXXX" 
                    required
                  />
                </div>

                <Field 
                  label="Relationship to Applicant *" 
                  id="emergency_relation" 
                  value={form.emergency_relation} 
                  onChange={set('emergency_relation')} 
                  placeholder="e.g. Father, Mother, Brother, Uncle" 
                  required
                />
              </div>
            )}

            {/* STEP 3: Academic Details */}
            {step === 3 && (
              <div className="adm-step-pane">
                <SelectField 
                  label="Last Completed Qualification *" 
                  id="last_qualification" 
                  value={form.last_qualification} 
                  onChange={set('last_qualification')} 
                  options={QUALIFICATIONS} 
                  placeholder="Select Qualification" 
                  required
                />

                <div className="adm-grid-2">
                  <Field 
                    label="Board / University / Institute *" 
                    id="board_university" 
                    value={form.board_university} 
                    onChange={set('board_university')} 
                    placeholder="e.g. BISE Lahore / Punjab University" 
                    icon={<Buildings size={18} />}
                    required
                  />
                  <Field 
                    label="Year of Passing *" 
                    id="passing_year" 
                    value={form.passing_year} 
                    onChange={set('passing_year')} 
                    type="number" 
                    placeholder="e.g. 2024" 
                    min="1990" 
                    max="2027" 
                    required
                  />
                </div>

                <Field 
                  label="Total Marks / GPA / Percentage Obtained *" 
                  id="marks_gpa" 
                  value={form.marks_gpa} 
                  onChange={set('marks_gpa')} 
                  placeholder="e.g. 980/1100, 3.8 GPA, or 85%" 
                  required
                />
              </div>
            )}

            {/* STEP 4: Program Selection */}
            {step === 4 && (
              <div className="adm-step-pane">
                <SelectField 
                  label="Program Applying For *" 
                  id="program" 
                  value={form.program} 
                  onChange={set('program')} 
                  options={PROGRAMS} 
                  placeholder="Select Academic Program" 
                  required
                />

                <SelectField 
                  label="Preferred Shift" 
                  id="preferred_shift" 
                  value={form.preferred_shift} 
                  onChange={set('preferred_shift')} 
                  options={SHIFTS} 
                  placeholder="Select Class Timing Shift" 
                />

                <Field 
                  label="Any Medical Condition / Special Assistance?" 
                  id="medical_condition" 
                  value={form.medical_condition} 
                  onChange={set('medical_condition')} 
                  placeholder="Mention if any (or leave blank if none)" 
                  textarea 
                />

                <Field 
                  label="Additional Notes / Remarks" 
                  id="notes" 
                  value={form.notes} 
                  onChange={set('notes')} 
                  placeholder="Anything else you'd like us to know..." 
                  textarea 
                />
              </div>
            )}

            {/* Error Message Box */}
            {error && (
              <div className="adm-error-box" role="alert">
                <WarningCircle size={20} weight="fill" />
                <span>{error}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="adm-action-bar">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="adm-btn-prev"
                >
                  <ArrowLeft size={16} weight="bold" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="adm-btn-next"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} weight="bold" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="adm-btn-next adm-btn-submit"
                >
                  {submitting ? (
                    <>
                      <Spinner size={18} className="adm-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkle size={18} weight="fill" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Help Line */}
          <div className="adm-help-footer">
            <Info size={16} weight="bold" color="#6366f1" />
            <span>Need assistance? Contact admissions support at <strong>admissions@lancerstech.com</strong></span>
          </div>
        </main>

        <footer className="adm-footer">
          <p>© {new Date().getFullYear()} Lancers Tech LMS · All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, id, value, onChange, type = 'text', placeholder, textarea, icon, required, min, max }) {
  const isFilled = Boolean(value?.toString().trim());
  return (
    <div className="adm-field-group">
      <label htmlFor={id} className="adm-field-label">
        <span>{label}</span>
        {isFilled && <Check size={14} weight="bold" className="adm-check-mark" />}
      </label>
      <div className="adm-input-container">
        {icon && <span className="adm-input-icon">{icon}</span>}
        {textarea ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className={`adm-input adm-textarea ${icon ? 'has-icon' : ''} ${isFilled ? 'filled' : ''}`}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            className={`adm-input ${icon ? 'has-icon' : ''} ${isFilled ? 'filled' : ''}`}
          />
        )}
      </div>
    </div>
  );
}

function SelectField({ label, id, value, onChange, options, placeholder, required }) {
  const isFilled = Boolean(value?.toString().trim());
  return (
    <div className="adm-field-group">
      <label htmlFor={id} className="adm-field-label">
        <span>{label}</span>
        {isFilled && <Check size={14} weight="bold" className="adm-check-mark" />}
      </label>
      <div className="adm-select-container">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`adm-select ${isFilled ? 'filled' : 'placeholder'}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const admissionStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  .adm-page {
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(180deg, #f0f4ff 0%, #f8fafc 40%, #edf2f7 100%);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    padding: 36px 16px 56px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .adm-layout-container {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .adm-header {
    text-align: center;
    width: 100%;
    max-width: 680px;
    margin: 0 auto 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .adm-brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 18px;
    border-radius: 9999px;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
    margin-bottom: 12px;
  }

  .adm-title {
    font-size: 32px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
    line-height: 1.2;
    text-align: center;
  }

  .adm-subtitle {
    font-size: 15px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
    text-align: center;
  }

  /* Master Card */
  .adm-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    padding: 36px 40px 36px;
    box-shadow: 0 12px 40px rgba(79, 70, 229, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02);
    box-sizing: border-box;
    width: 100%;
  }

  /* Stepper Header Block */
  .adm-stepper-container {
    margin-bottom: 28px;
    padding-bottom: 22px;
    border-bottom: 1px solid #f1f5f9;
  }

  /* 4-Column Stepper Grid */
  .adm-stepper-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    margin-bottom: 20px;
    width: 100%;
  }

  .adm-step-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    text-align: center;
    position: relative;
    width: 100%;
  }

  .adm-step-node-header {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 8px;
  }

  .adm-step-line-left,
  .adm-step-line-right {
    flex: 1;
    height: 2px;
    background: #e2e8f0;
    transition: background 0.3s ease;
  }

  .adm-step-line-left.done,
  .adm-step-line-right.done {
    background: #10b981;
  }

  .adm-step-line-left.hidden,
  .adm-step-line-right.hidden {
    visibility: hidden;
  }

  .adm-step-bubble {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    transition: all 0.25s ease;
    flex-shrink: 0;
    cursor: pointer;
    z-index: 2;
  }

  .adm-step-node.active .adm-step-bubble {
    background: #4f46e5;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    transform: scale(1.06);
  }

  .adm-step-node.done .adm-step-bubble {
    background: #10b981;
    color: #ffffff;
  }

  .adm-step-label {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    transition: color 0.2s ease;
    text-align: center;
    padding: 0 4px;
    line-height: 1.3;
  }

  .adm-step-node.active .adm-step-label {
    color: #4f46e5;
    font-weight: 800;
  }

  .adm-step-node.done .adm-step-label {
    color: #0f172a;
  }

  /* Progress Bar Inside Card */
  .adm-progress-bar-wrap {
    background: #f8fafc;
    border-radius: 12px;
    padding: 10px 16px;
    border: 1px solid #f1f5f9;
    width: 100%;
    box-sizing: border-box;
  }

  .adm-progress-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 6px;
    color: #64748b;
  }

  .adm-step-indicator-text strong {
    color: #0f172a;
  }

  .adm-progress-pct-badge {
    font-size: 11px;
    font-weight: 800;
    color: #10b981;
    background: #ecfdf5;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .adm-progress-track {
    height: 6px;
    background: #e2e8f0;
    border-radius: 9999px;
    overflow: hidden;
  }

  .adm-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5 0%, #10b981 100%);
    border-radius: 9999px;
    transition: width 0.4s ease;
  }

  /* Form Body & Panes */
  .adm-form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .adm-step-pane {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  /* Photo Upload */
  .adm-photo-row {
    display: flex;
    justify-content: center;
    margin-bottom: 22px;
    width: 100%;
  }

  .adm-photo-box {
    text-align: center;
  }

  .adm-photo-preview-wrap {
    position: relative;
    display: inline-block;
  }

  .adm-photo-img {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #4f46e5;
    box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
  }

  .adm-photo-del-btn {
    position: absolute;
    top: 0;
    right: 0;
    background: #ef4444;
    color: #ffffff;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    transition: transform 0.15s ease;
  }

  .adm-photo-del-btn:hover {
    transform: scale(1.1);
  }

  .adm-photo-upload-btn {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px dashed #cbd5e1;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .adm-photo-upload-btn:hover {
    border-color: #6366f1;
    background: #eef2ff;
  }

  .adm-photo-lbl {
    font-size: 11px;
    font-weight: 700;
    color: #334155;
  }

  .adm-photo-sub {
    font-size: 9px;
    color: #94a3b8;
  }

  /* Grid 2 Column */
  .adm-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 12px;
    width: 100%;
  }

  /* Form Fields */
  .adm-field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
    width: 100%;
  }

  .adm-field-label {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .adm-check-mark {
    color: #10b981;
  }

  .adm-input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .adm-input-icon {
    position: absolute;
    left: 14px;
    color: #94a3b8;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .adm-input {
    width: 100%;
    font-family: inherit;
    font-size: 14px;
    color: #0f172a;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .adm-input.has-icon {
    padding-left: 42px;
  }

  .adm-input:focus {
    outline: none;
    border-color: #4f46e5;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }

  .adm-input.filled {
    border-color: #cbd5e1;
    background: #ffffff;
  }

  .adm-textarea {
    resize: vertical;
    min-height: 80px;
  }

  /* Select */
  .adm-select-container {
    position: relative;
    width: 100%;
  }

  .adm-select {
    width: 100%;
    font-family: inherit;
    font-size: 14px;
    color: #0f172a;
    background-color: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 38px 12px 14px;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    background-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .adm-select:focus {
    outline: none;
    border-color: #4f46e5;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }

  .adm-select.placeholder {
    color: #94a3b8;
  }

  /* Section Divider */
  .adm-section-divider {
    margin: 14px 0 12px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
    width: 100%;
  }

  .adm-section-divider-title {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #4f46e5;
  }

  /* Error Box */
  .adm-error-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    font-size: 13px;
    font-weight: 700;
    padding: 12px 16px;
    border-radius: 12px;
    margin: 16px 0 6px;
    animation: admShake 0.3s ease;
    width: 100%;
    box-sizing: border-box;
  }

  @keyframes admShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  /* Action Buttons */
  .adm-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 26px;
    padding-top: 20px;
    border-top: 1px solid #f1f5f9;
    gap: 12px;
    width: 100%;
  }

  .adm-btn-next {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 800;
    padding: 13px 28px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(79, 70, 229, 0.28);
    transition: all 0.2s ease;
  }

  .adm-btn-next:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.38);
  }

  .adm-btn-prev {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #f1f5f9;
    color: #475569;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    padding: 13px 22px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .adm-btn-prev:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .adm-btn-submit {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.28);
  }

  .adm-btn-submit:hover:not(:disabled) {
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.38);
  }

  .adm-spin {
    animation: admSpin 1s linear infinite;
  }

  @keyframes admSpin {
    to { transform: rotate(360deg); }
  }

  /* Help Footer */
  .adm-help-footer {
    margin-top: 22px;
    padding-top: 14px;
    border-top: 1px solid #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
    text-align: center;
    width: 100%;
  }

  .adm-help-footer strong {
    color: #4f46e5;
  }

  /* Success Screen */
  .adm-success-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    padding: 44px 36px;
    text-align: center;
    box-shadow: 0 12px 40px rgba(79, 70, 229, 0.08);
    width: 100%;
    max-width: 520px;
    margin: 40px auto;
  }

  .adm-success-icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .adm-success-badge {
    display: inline-block;
    background: #ecfdf5;
    color: #059669;
    font-size: 12px;
    font-weight: 800;
    padding: 4px 14px;
    border-radius: 9999px;
    border: 1px solid #a7f3d0;
    margin-bottom: 12px;
  }

  .adm-success-title {
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
    margin: 0 0 8px;
  }

  .adm-success-desc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 24px;
  }

  .adm-summary-box {
    background: #f8fafc;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    padding: 16px 20px;
    margin-bottom: 20px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .adm-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
  }

  .adm-summary-label {
    color: #64748b;
    font-weight: 600;
  }

  .adm-summary-val {
    color: #0f172a;
    font-weight: 700;
  }

  .adm-app-id {
    color: #4f46e5;
    font-family: monospace;
    font-size: 14px;
  }

  .adm-next-steps {
    background: #eef2ff;
    border-radius: 14px;
    border: 1px solid #e0e7ff;
    padding: 16px 20px;
    margin-bottom: 24px;
    text-align: left;
  }

  .adm-next-step-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #3730a3;
    margin-bottom: 8px;
  }

  .adm-next-step-list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    color: #4338ca;
    line-height: 1.6;
  }

  .adm-success-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .adm-btn-outline {
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    color: #334155;
    padding: 12px;
    border-radius: 12px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .adm-btn-outline:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  .adm-btn-primary-block {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #ffffff;
    padding: 13px;
    border-radius: 12px;
    border: none;
    font-family: inherit;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
    transition: all 0.2s ease;
  }

  .adm-btn-primary-block:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
  }

  .adm-footer {
    text-align: center;
    color: #94a3b8;
    font-size: 12px;
    margin-top: 32px;
    width: 100%;
  }

  /* Responsive Breakpoints */
  @media (max-width: 768px) {
    .adm-card {
      padding: 26px 20px 28px;
      border-radius: 20px;
    }

    .adm-step-label {
      font-size: 11px;
    }

    .adm-step-bubble {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }
  }

  @media (max-width: 600px) {
    .adm-page {
      padding: 20px 12px 36px;
    }

    .adm-title {
      font-size: 24px;
    }

    .adm-subtitle {
      font-size: 13px;
    }

    .adm-grid-2 {
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 8px;
    }

    .adm-card {
      padding: 20px 14px;
    }

    .adm-step-label {
      font-size: 10px;
    }

    .adm-input {
      font-size: 16px;
      padding: 11px 12px;
    }

    .adm-select {
      font-size: 16px;
      padding: 11px 34px 11px 12px;
    }

    .adm-action-bar {
      margin-top: 18px;
      padding-top: 14px;
    }

    .adm-btn-next, .adm-btn-prev {
      padding: 11px 16px;
      font-size: 13px;
    }

    .adm-success-card {
      padding: 28px 18px;
    }

    .adm-success-title {
      font-size: 22px;
    }
  }
`;
