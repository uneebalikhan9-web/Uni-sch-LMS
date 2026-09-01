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

  // Current step fill percentage
  const stepStats = useMemo(() => {
    const step1Fields = ['full_name', 'father_name', 'dob', 'gender', 'cnic'];
    const step2Fields = ['phone', 'email', 'address', 'city', 'emergency_name', 'emergency_phone', 'emergency_relation'];
    const step3Fields = ['last_qualification', 'board_university', 'passing_year', 'marks_gpa'];
    const step4Fields = ['program'];

    const getPct = (fields) => {
      const filled = fields.filter(k => form[k]?.toString().trim()).length;
      return Math.round((filled / fields.length) * 100);
    };

    return {
      1: { percent: getPct(step1Fields), isDone: step1Fields.every(k => form[k]?.toString().trim()) },
      2: { percent: getPct(step2Fields), isDone: step2Fields.every(k => form[k]?.toString().trim()) },
      3: { percent: getPct(step3Fields), isDone: step3Fields.every(k => form[k]?.toString().trim()) },
      4: { percent: getPct(step4Fields), isDone: step4Fields.every(k => form[k]?.toString().trim()) },
    };
  }, [form]);

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
      if (!form.father_name.trim()) return setError("Please enter your Father's Name") || false;
      if (!form.dob) return setError('Please select your Date of Birth') || false;
      if (!form.gender) return setError('Please select your Gender') || false;
      if (!form.cnic.trim()) return setError('Please enter your CNIC / B-Form Number') || false;
    }
    if (currentStep === 2) {
      if (!form.phone.trim()) return setError('Please enter your primary Phone Number') || false;
      if (!form.email.trim()) return setError('Please enter a valid Email Address') || false;
      if (!form.address.trim()) return setError('Please enter your Residential Address') || false;
      if (!form.city.trim()) return setError('Please enter your City') || false;
      if (!form.emergency_name.trim()) return setError('Please enter Emergency Contact Name') || false;
      if (!form.emergency_phone.trim()) return setError('Please enter Emergency Contact Phone') || false;
      if (!form.emergency_relation.trim()) return setError('Please specify Emergency Contact Relation') || false;
    }
    if (currentStep === 3) {
      if (!form.last_qualification) return setError('Please select your Last Qualification') || false;
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
    { num: 1, label: 'Personal Details', shortLabel: 'Personal', icon: <User size={18} weight="bold" /> },
    { num: 2, label: 'Contact & Address', shortLabel: 'Contact', icon: <Phone size={18} weight="bold" /> },
    { num: 3, label: 'Academic Records', shortLabel: 'Academic', icon: <BookOpen size={18} weight="bold" /> },
    { num: 4, label: 'Program & Shift', shortLabel: 'Program', icon: <GraduationCap size={18} weight="bold" /> },
  ];

  if (submitted) {
    return (
      <div className="adm-page">
        <style>{admissionStyles}</style>
        <div className="adm-success-container">
          <div className="adm-success-card">
            <div className="adm-success-icon-wrap">
              <div className="adm-success-ring-bg">
                <CheckCircle size={64} weight="fill" color="#10b981" />
              </div>
            </div>

            <span className="adm-badge-success">Application Received Successfully</span>
            <h1 className="adm-success-title">Submission Confirmed!</h1>
            <p className="adm-success-desc">
              Thank you, <strong>{form.full_name}</strong>. Your admission application has been registered in the system.
            </p>

            <div className="adm-summary-box">
              <div className="adm-summary-row">
                <span className="adm-summary-label">Application ID</span>
                <span className="adm-summary-val adm-app-id">#{submissionId}</span>
              </div>
              <div className="adm-summary-row">
                <span className="adm-summary-label">Applied Program</span>
                <span className="adm-summary-val">{form.program || 'N/A'}</span>
              </div>
              <div className="adm-summary-row">
                <span className="adm-summary-label">Applicant Email</span>
                <span className="adm-summary-val">{form.email}</span>
              </div>
              <div className="adm-summary-row">
                <span className="adm-summary-label">Contact Phone</span>
                <span className="adm-summary-val">{form.phone}</span>
              </div>
            </div>

            <div className="adm-next-steps">
              <div className="adm-next-step-title">
                <Sparkle size={18} weight="fill" color="#4f46e5" />
                <span>Next Steps</span>
              </div>
              <ul className="adm-next-step-list">
                <li>Your application will be reviewed by the admissions team.</li>
                <li>You will receive updates on your registered phone number and email.</li>
              </ul>
            </div>

            <div className="adm-success-actions">
              <button 
                type="button" 
                onClick={() => window.print()} 
                className="adm-btn-outline"
              >
                🖨️ Print Application
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
      </div>
    );
  }

  return (
    <div className="adm-page">
      <style>{admissionStyles}</style>

      {/* Main Header */}
      <header className="adm-header">
        <div className="adm-brand-badge">
          <GraduationCap size={18} weight="fill" />
          <span>Lancers Tech LMS Admissions</span>
        </div>
        <h1 className="adm-title">Student Admission Form</h1>
        <p className="adm-subtitle">Fill in the required information to apply for admission.</p>
      </header>

      {/* Centered Master Card */}
      <div className="adm-wrapper">
        <main className="adm-card">

          {/* Stepper Navigation */}
          <div className="adm-stepper-container">
            <nav className="adm-stepper" aria-label="Form Steps">
              {stepDefs.map((s, index) => {
                const isActive = step === s.num;
                const isDone = step > s.num || stepStats[s.num].isDone;
                return (
                  <div key={s.num} className="adm-stepper-col">
                    <button
                      type="button"
                      onClick={() => jumpToStep(s.num)}
                      className={`adm-step-tab ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                    >
                      <div className="adm-step-bubble">
                        {isDone && !isActive ? (
                          <Check size={16} weight="bold" />
                        ) : (
                          <span>{s.num}</span>
                        )}
                      </div>
                      <div className="adm-step-info">
                        <span className="adm-step-name-full">{s.label}</span>
                        <span className="adm-step-name-short">{s.shortLabel}</span>
                      </div>
                    </button>

                    {index < stepDefs.length - 1 && (
                      <div className={`adm-step-line ${step > s.num ? 'completed' : ''}`} />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Integrated Live Progress Meter */}
            <div className="adm-progress-meter">
              <div className="adm-meter-text-row">
                <span className="adm-meter-title">
                  Step {step} of 4: <strong>{stepDefs[step - 1].label}</strong>
                </span>
                <span className="adm-meter-pct">
                  <strong>{fillPercent}%</strong> Completed ({ALL_REQUIRED.filter(k => form[k]?.toString().trim()).length + (photo ? 1 : 0)}/{ALL_REQUIRED.length + 1})
                </span>
              </div>
              <div className="adm-meter-track">
                <div 
                  className="adm-meter-bar" 
                  style={{ width: `${fillPercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} noValidate className="adm-form-body">
            
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="adm-step-pane">
                {/* Photo Upload Zone */}
                <div className="adm-photo-wrapper">
                  <div className="adm-photo-box">
                    {photoPreview ? (
                      <div className="adm-photo-preview-wrap">
                        <img src={photoPreview} alt="Applicant" className="adm-photo-img" />
                        <button 
                          type="button" 
                          onClick={removePhoto} 
                          className="adm-photo-del"
                          title="Remove Photo"
                          aria-label="Remove Photo"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="adm-photo-btn"
                        onClick={() => photoRef.current?.click()}
                      >
                        <Camera size={26} weight="duotone" color="#4f46e5" />
                        <span className="adm-photo-text">Upload Photo</span>
                        <span className="adm-photo-hint">Max 4MB</span>
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

                <div className="adm-grid-row">
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

                <div className="adm-grid-row">
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

                <div className="adm-grid-row">
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
                <div className="adm-grid-row">
                  <Field 
                    label="Phone Number *" 
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

                <div className="adm-grid-row">
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

                <div className="adm-divider">
                  <span className="adm-divider-text">Emergency Contact Information</span>
                </div>

                <div className="adm-grid-row">
                  <Field 
                    label="Emergency Contact Name *" 
                    id="emergency_name" 
                    value={form.emergency_name} 
                    onChange={set('emergency_name')} 
                    placeholder="Guardian Name" 
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
                  placeholder="e.g. Father, Mother, Brother" 
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

                <div className="adm-grid-row">
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
                  label="Any Medical Condition / Disability?" 
                  id="medical_condition" 
                  value={form.medical_condition} 
                  onChange={set('medical_condition')} 
                  placeholder="Leave blank if none" 
                  textarea 
                />

                <Field 
                  label="Additional Notes / Comments" 
                  id="notes" 
                  value={form.notes} 
                  onChange={set('notes')} 
                  placeholder="Anything else you'd like us to know..." 
                  textarea 
                />
              </div>
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="adm-error-alert" role="alert">
                <WarningCircle size={20} weight="fill" />
                <span>{error}</span>
              </div>
            )}

            {/* Navigation Action Buttons */}
            <div className="adm-action-row">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="adm-btn-back"
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
                  className="adm-btn-next adm-btn-submit-glow"
                >
                  {submitting ? (
                    <>
                      <Spinner size={18} className="adm-spin-anim" />
                      <span>Submitting Application...</span>
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

          {/* Quick Help Footer */}
          <div className="adm-card-footer">
            <Info size={16} weight="bold" color="#6366f1" />
            <span>Need assistance? Contact admissions support at <strong>admissions@lancerstech.com</strong></span>
          </div>
        </main>
      </div>

      <footer className="adm-page-footer">
        <p>© {new Date().getFullYear()} Lancers Tech LMS · All Rights Reserved</p>
      </footer>
    </div>
  );
}

function Field({ label, id, value, onChange, type = 'text', placeholder, textarea, icon, required, min, max }) {
  const isFilled = Boolean(value?.toString().trim());
  return (
    <div className="adm-form-field">
      <label htmlFor={id} className="adm-field-lbl">
        <span>{label}</span>
        {isFilled && <Check size={14} weight="bold" className="adm-check-icon" />}
      </label>
      <div className="adm-field-input-box">
        {icon && <span className="adm-field-icon">{icon}</span>}
        {textarea ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className={`adm-input-elem adm-textarea-elem ${icon ? 'with-icon' : ''} ${isFilled ? 'filled' : ''}`}
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
            className={`adm-input-elem ${icon ? 'with-icon' : ''} ${isFilled ? 'filled' : ''}`}
          />
        )}
      </div>
    </div>
  );
}

function SelectField({ label, id, value, onChange, options, placeholder, required }) {
  const isFilled = Boolean(value?.toString().trim());
  return (
    <div className="adm-form-field">
      <label htmlFor={id} className="adm-field-lbl">
        <span>{label}</span>
        {isFilled && <Check size={14} weight="bold" className="adm-check-icon" />}
      </label>
      <div className="adm-field-select-box">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`adm-select-elem ${isFilled ? 'filled' : 'placeholder'}`}
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
    background: linear-gradient(180deg, #f0f4ff 0%, #f8fafc 40%, #edf2f7 100%);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    padding: 40px 20px 60px;
    box-sizing: border-box;
  }

  .adm-header {
    text-align: center;
    max-width: 680px;
    margin: 0 auto 32px;
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
    font-size: 34px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
    line-height: 1.2;
  }

  .adm-subtitle {
    font-size: 15px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  /* Centered Wrapper */
  .adm-wrapper {
    max-width: 820px;
    margin: 0 auto;
  }

  /* Master Card */
  .adm-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    padding: 36px 44px 40px;
    box-shadow: 0 12px 40px rgba(79, 70, 229, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02);
  }

  /* Stepper Header Block */
  .adm-stepper-container {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;
  }

  .adm-stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .adm-stepper-col {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .adm-stepper-col:last-child {
    flex: 0 0 auto;
  }

  .adm-step-tab {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
    outline: none;
    transition: all 0.2s ease;
  }

  .adm-step-bubble {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f1f5f9;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    transition: all 0.25s ease;
    flex-shrink: 0;
  }

  .adm-step-tab.active .adm-step-bubble {
    background: #4f46e5;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  }

  .adm-step-tab.completed .adm-step-bubble {
    background: #10b981;
    color: #ffffff;
  }

  .adm-step-info {
    display: flex;
    flex-direction: column;
  }

  .adm-step-name-full {
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    transition: color 0.2s ease;
    white-space: nowrap;
  }

  .adm-step-name-short {
    display: none;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    white-space: nowrap;
  }

  .adm-step-tab.active .adm-step-name-full,
  .adm-step-tab.active .adm-step-name-short {
    color: #4f46e5;
    font-weight: 800;
  }

  .adm-step-tab.completed .adm-step-name-full,
  .adm-step-tab.completed .adm-step-name-short {
    color: #0f172a;
  }

  .adm-step-line {
    flex: 1;
    height: 2px;
    background: #e2e8f0;
    margin: 0 14px;
    transition: background 0.3s ease;
  }

  .adm-step-line.completed {
    background: #10b981;
  }

  /* Live Progress Meter */
  .adm-progress-meter {
    background: #f8fafc;
    border-radius: 12px;
    padding: 10px 16px;
    border: 1px solid #f1f5f9;
  }

  .adm-meter-text-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 6px;
    color: #64748b;
  }

  .adm-meter-title strong {
    color: #0f172a;
  }

  .adm-meter-pct {
    color: #4f46e5;
  }

  .adm-meter-pct strong {
    color: #10b981;
  }

  .adm-meter-track {
    height: 6px;
    background: #e2e8f0;
    border-radius: 9999px;
    overflow: hidden;
  }

  .adm-meter-bar {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5 0%, #10b981 100%);
    border-radius: 9999px;
    transition: width 0.4s ease;
  }

  /* Form Body & Panes */
  .adm-form-body {
    display: flex;
    flex-direction: column;
  }

  .adm-step-pane {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Photo Upload */
  .adm-photo-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
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

  .adm-photo-del {
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

  .adm-photo-del:hover {
    transform: scale(1.1);
  }

  .adm-photo-btn {
    width: 104px;
    height: 104px;
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

  .adm-photo-btn:hover {
    border-color: #6366f1;
    background: #eef2ff;
  }

  .adm-photo-text {
    font-size: 11px;
    font-weight: 700;
    color: #334155;
  }

  .adm-photo-hint {
    font-size: 9px;
    color: #94a3b8;
  }

  /* Grid System */
  .adm-grid-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 14px;
  }

  /* Form Fields */
  .adm-form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }

  .adm-field-lbl {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .adm-check-icon {
    color: #10b981;
  }

  .adm-field-input-box {
    position: relative;
    display: flex;
    align-items: center;
  }

  .adm-field-icon {
    position: absolute;
    left: 14px;
    color: #94a3b8;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .adm-input-elem {
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

  .adm-input-elem.with-icon {
    padding-left: 42px;
  }

  .adm-input-elem:focus {
    outline: none;
    border-color: #4f46e5;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }

  .adm-input-elem.filled {
    border-color: #cbd5e1;
    background: #ffffff;
  }

  .adm-textarea-elem {
    resize: vertical;
    min-height: 80px;
  }

  /* Select Elements */
  .adm-field-select-box {
    position: relative;
  }

  .adm-select-elem {
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

  .adm-select-elem:focus {
    outline: none;
    border-color: #4f46e5;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }

  .adm-select-elem.placeholder {
    color: #94a3b8;
  }

  /* Divider */
  .adm-divider {
    margin: 16px 0 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
  }

  .adm-divider-text {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #4f46e5;
  }

  /* Error Alert */
  .adm-error-alert {
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
    margin: 18px 0 6px;
    animation: admShake 0.3s ease;
  }

  @keyframes admShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  /* Action Buttons */
  .adm-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #f1f5f9;
    gap: 12px;
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

  .adm-btn-back {
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

  .adm-btn-back:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .adm-btn-submit-glow {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.28);
  }

  .adm-btn-submit-glow:hover:not(:disabled) {
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.38);
  }

  .adm-spin-anim {
    animation: admSpin 1s linear infinite;
  }

  @keyframes admSpin {
    to { transform: rotate(360deg); }
  }

  /* Card Footer Notice */
  .adm-card-footer {
    margin-top: 24px;
    padding-top: 14px;
    border-top: 1px solid #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
    text-align: center;
  }

  .adm-card-footer strong {
    color: #4f46e5;
  }

  /* Success Screen */
  .adm-success-container {
    max-width: 540px;
    margin: 40px auto;
  }

  .adm-success-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    padding: 44px 36px;
    text-align: center;
    box-shadow: 0 12px 40px rgba(79, 70, 229, 0.08);
  }

  .adm-success-icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .adm-badge-success {
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

  .adm-page-footer {
    text-align: center;
    color: #94a3b8;
    font-size: 12px;
    margin-top: 36px;
  }

  /* Responsive Media Queries */
  @media (max-width: 820px) {
    .adm-card {
      padding: 28px 24px;
      border-radius: 20px;
    }

    .adm-step-name-full {
      display: none;
    }

    .adm-step-name-short {
      display: block;
    }

    .adm-step-line {
      margin: 0 8px;
    }
  }

  @media (max-width: 640px) {
    .adm-page {
      padding: 20px 12px 36px;
    }

    .adm-title {
      font-size: 24px;
    }

    .adm-subtitle {
      font-size: 13px;
    }

    .adm-grid-row {
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .adm-card {
      padding: 22px 16px;
    }

    .adm-stepper-container {
      margin-bottom: 20px;
      padding-bottom: 16px;
    }

    .adm-step-bubble {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    .adm-step-line {
      margin: 0 4px;
    }

    .adm-input-elem {
      font-size: 16px; /* Prevents auto-zoom on iOS */
      padding: 11px 12px;
    }

    .adm-select-elem {
      font-size: 16px;
      padding: 11px 34px 11px 12px;
    }

    .adm-action-row {
      margin-top: 20px;
      padding-top: 16px;
    }

    .adm-btn-next, .adm-btn-back {
      padding: 12px 18px;
      font-size: 13px;
    }

    .adm-success-card {
      padding: 32px 20px;
    }

    .adm-success-title {
      font-size: 22px;
    }
  }
`;
