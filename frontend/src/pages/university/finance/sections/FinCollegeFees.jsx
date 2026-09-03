import React, { useState, useEffect } from "react";
import {
  Plus, Trash, PencilSimple, FloppyDisk, X, Buildings,
  Student, Bus, Barbell, Desktop, CurrencyDollar, CalendarBlank,
  Lightning, ChartBar, ArrowsClockwise, CheckCircle, Warning
} from "@phosphor-icons/react";
import API_BASE_URL from "../../../../config/api";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const FinCollegeFees = ({ isCollege }) => {
  const token = sessionStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    class_name: "", tuition_fee: "", transport_fee: "",
    activity_fee: "", computer_fee: "", other_fee: "",
    late_fine_per_day: "50", due_day: "10"
  });

  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);

  useEffect(() => { fetchStructures(); }, []);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/school-fee-structures`, { headers });
      const data = await res.json();
      if (data.success) setStructures(data.structures || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEdit = (s) => {
    setForm({ class_name: s.class_name, tuition_fee: s.tuition_fee, transport_fee: s.transport_fee, activity_fee: s.activity_fee, computer_fee: s.computer_fee, other_fee: s.other_fee, late_fine_per_day: s.late_fine_per_day, due_day: s.due_day });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fee structure?")) return;
    await fetch(`${API_BASE_URL}/api/finance/school-fee-structures/${id}`, { method: "DELETE", headers });
    fetchStructures();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/school-fee-structures`, { method: "POST", headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        setShowForm(false); setEditingId(null);
        setForm({ class_name: "", tuition_fee: "", transport_fee: "", activity_fee: "", computer_fee: "", other_fee: "", late_fine_per_day: "50", due_day: "10" });
        fetchStructures();
      } else { alert(data.message || "Failed to save"); }
    } catch(e) { alert("Network error"); }
    finally { setSaving(false); }
  };

  const handleGenerateMonthly = async () => {
    setGenerating(true); setGenResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/challans/generate-monthly`, { method: "POST", headers, body: JSON.stringify({ month: genMonth, year: genYear }) });
      const data = await res.json();
      setGenResult({ success: data.success, message: data.message || (data.success ? "Challans generated!" : "Failed to generate") });
    } catch(e) { setGenResult({ success: false, message: "Network error" }); }
    finally { setGenerating(false); }
  };

  const totalFee = (s) => (+s.tuition_fee||0) + (+s.transport_fee||0) + (+s.activity_fee||0) + (+s.computer_fee||0) + (+s.other_fee||0);

  const feeItems = [
    { key: "tuition_fee", label: "Tuition", icon: <Student size={14} />, color: "#4f46e5" },
    { key: "transport_fee", label: "Transport", icon: <Bus size={14} />, color: "#0891b2" },
    { key: "activity_fee", label: "Activity", icon: <Barbell size={14} />, color: "#d97706" },
    { key: "computer_fee", label: "Computer Lab", icon: <Desktop size={14} />, color: "#7c3aed" },
    { key: "other_fee", label: "Other", icon: <CurrencyDollar size={14} />, color: "#059669" },
  ];

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", color: "#0f172a", background: "#f8fafc", outline: "none", boxSizing: "border-box", fontWeight: 600 };
  const labelStyle = { display: "block", marginBottom: "6px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" };

  return (
    <div className="fin-animate">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 12, padding: "8px 10px", display: "flex" }}>
              <ChartBar size={20} color="white" weight="bold" />
            </span>
            Class / Grade Fee Setup
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "6px 0 0" }}>
            Define monthly fee amounts per class. Used when generating monthly challans.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => setShowGenModal(true)} style={{ padding: "10px 18px", background: "linear-gradient(135deg,#059669,#10b981)", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
            <Lightning size={16} weight="fill" /> Generate Monthly Fees
          </button>
          <button onClick={() => { setEditingId(null); setForm({ class_name: "", tuition_fee: "", transport_fee: "", activity_fee: "", computer_fee: "", other_fee: "", late_fine_per_day: "50", due_day: "10" }); setShowForm(true); }} style={{ padding: "10px 18px", background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}>
            <Plus size={16} weight="bold" /> Add Class Fee
          </button>
        </div>
      </div>

      {/* Stats */}
      {structures.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Classes", value: structures.length, color: "#4f46e5", bg: "#eef2ff", icon: <Buildings size={20} weight="fill" /> },
            { label: "Avg Monthly Fee", value: `Rs. ${Math.round(structures.reduce((s,x) => s + totalFee(x), 0) / structures.length).toLocaleString()}`, color: "#059669", bg: "#f0fdf4", icon: <CurrencyDollar size={20} weight="fill" /> },
            { label: "Highest Fee", value: `Rs. ${Math.max(...structures.map(s => totalFee(s))).toLocaleString()}`, color: "#d97706", bg: "#fffbeb", icon: <ChartBar size={20} weight="fill" /> },
            { label: "Due Day", value: `${structures[0]?.due_day || 10}th`, color: "#7c3aed", bg: "#f5f3ff", icon: <CalendarBlank size={20} weight="fill" /> },
          ].map((st, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, padding: "1rem 1.2rem", border: "1.5px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: st.bg, borderRadius: 12, padding: "10px", color: st.color }}>{st.icon}</div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: st.color }}>{st.value}</div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{st.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
          <ArrowsClockwise size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Loading fee structures...</p>
        </div>
      ) : structures.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", background: "white", borderRadius: 20, border: "2px dashed #e2e8f0" }}>
          <Buildings size={56} style={{ opacity: 0.2, marginBottom: "16px", color: "#4f46e5" }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155", margin: "0 0 8px" }}>No Fee Structures Defined</p>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0 0 20px" }}>Click "Add Class Fee" to set up your first class fee structure.</p>
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} weight="bold" /> Add First Class
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.2rem" }}>
          {structures.map(s => (
            <div key={s.id} style={{ background: "white", borderRadius: 20, padding: "1.5rem", border: "1.5px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 30px rgba(79,70,229,0.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#4f46e5,#7c3aed)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem", marginTop: 4 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ background: "#eef2ff", borderRadius: 10, padding: "8px", color: "#4f46e5" }}><Student size={18} weight="fill" /></div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{s.class_name}</h3>
                  </div>
                  <div style={{ marginTop: 6, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                    Due on {s.due_day}th of every month
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#059669" }}>Rs. {totalFee(s).toLocaleString()}</div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Total / Month</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1.2rem" }}>
                {feeItems.map(({ key, label, icon, color }) => +s[key] > 0 && (
                  <div key={key} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color, background: `${color}18`, borderRadius: 6, padding: "4px", display: "flex" }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>Rs. {Number(s[key]).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              {+s.late_fine_per_day > 0 && (
                <div style={{ background: "#fef9ee", borderRadius: 10, padding: "8px 12px", marginBottom: "1rem", fontSize: "0.8rem", color: "#d97706", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Warning size={14} weight="fill" /> Late fine: Rs. {Number(s.late_fine_per_day).toLocaleString()} / day
                </div>
              )}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                <button onClick={() => handleEdit(s)} style={{ background: "#eef2ff", color: "#4f46e5", border: "none", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
                  <PencilSimple size={14} weight="bold" /> Edit
                </button>
                <button onClick={() => handleDelete(s.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", padding: "7px 12px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 700, fontSize: "0.8rem" }}>
                  <Trash size={14} weight="bold" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }} onClick={() => setShowForm(false)}>
          <div style={{ background: "white", borderRadius: 24, padding: "2rem", width: "90%", maxWidth: "560px", boxShadow: "0 25px 60px -12px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 12, padding: "8px", color: "white" }}><ChartBar size={18} weight="fill" /></div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{editingId ? "Edit" : "Add"} Class Fee Structure</h3>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", borderRadius: 8, padding: "6px", display: "flex" }}><X size={18} weight="bold" /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>Class / Grade Name *</label>
                <input style={inputStyle} placeholder="e.g. Class 1, Grade 5, Montessori" value={form.class_name} onChange={e => setForm({...form, class_name: e.target.value})} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
                {[
                  { key: "tuition_fee", label: "Tuition Fee (Rs.)" },
                  { key: "transport_fee", label: "Transport Fee (Rs.)" },
                  { key: "activity_fee", label: "Activity Fee (Rs.)" },
                  { key: "computer_fee", label: "Computer Lab Fee (Rs.)" },
                  { key: "other_fee", label: "Other Fee (Rs.)" },
                  { key: "late_fine_per_day", label: "Late Fine / Day (Rs.)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input style={inputStyle} type="number" min="0" placeholder="0" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Fee Due Day (1-28)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input style={{ ...inputStyle, maxWidth: "100px" }} type="number" min="1" max="28" value={form.due_day} onChange={e => setForm({...form, due_day: e.target.value})} />
                  <span style={{ fontSize: "0.82rem", color: "#64748b" }}>e.g. 10 = due on 10th of every month</span>
                </div>
              </div>
              <div style={{ background: "linear-gradient(135deg,#eef2ff,#e0e7ff)", borderRadius: 16, padding: "16px", marginBottom: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Total Monthly Fee</div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#4f46e5" }}>
                  Rs. {[form.tuition_fee, form.transport_fee, form.activity_fee, form.computer_fee, form.other_fee].reduce((sum, v) => sum + (+v||0), 0).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "white", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "white", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
                  <FloppyDisk size={16} weight="bold" /> {saving ? "Saving..." : "Save Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }} onClick={() => { setShowGenModal(false); setGenResult(null); }}>
          <div style={{ background: "white", borderRadius: 24, padding: "2.5rem", width: "90%", maxWidth: "440px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.5rem" }}>
              <div style={{ background: "linear-gradient(135deg,#059669,#10b981)", borderRadius: 12, padding: "10px", color: "white" }}><Lightning size={20} weight="fill" /></div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>Generate Monthly Challans</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem", marginLeft: 56 }}>Creates one fee challan per student based on their class fee structure.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={labelStyle}>Month</label>
                <select value={genMonth} onChange={e => setGenMonth(Number(e.target.value))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", fontWeight: 600, background: "#f8fafc", outline: "none" }}>
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input type="number" value={genYear} onChange={e => setGenYear(Number(e.target.value))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: "0.9rem", fontWeight: 600, background: "#f8fafc", outline: "none", boxSizing: "border-box" }} min="2020" max="2035" />
              </div>
            </div>
            <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 16px", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarBlank size={16} weight="fill" /> Generating challans for: <strong>{MONTHS[genMonth-1]} {genYear}</strong>
            </div>
            {genResult && (
              <div style={{ background: genResult.success ? "#f0fdf4" : "#fef2f2", borderRadius: 12, padding: "12px 16px", marginBottom: "1.2rem", fontSize: "0.85rem", color: genResult.success ? "#059669" : "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                {genResult.success ? <CheckCircle size={16} weight="fill" /> : <Warning size={16} weight="fill" />}
                {genResult.message}
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowGenModal(false); setGenResult(null); }} style={{ padding: "10px 20px", background: "white", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
                {genResult?.success ? "Close" : "Cancel"}
              </button>
              {!genResult?.success && (
                <button onClick={handleGenerateMonthly} disabled={generating} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#059669,#10b981)", color: "white", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: generating ? 0.7 : 1 }}>
                  <Lightning size={16} weight="fill" /> {generating ? "Generating..." : "Generate Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinCollegeFees;
