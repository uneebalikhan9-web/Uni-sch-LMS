import React, { useState, useEffect } from "react";
import { MagnifyingGlass, Printer, Envelope, CheckCircle, Receipt, Trash, CalendarBlank, Warning, Plus, CurrencyDollar, X, Check, Student, ArrowsClockwise, FunnelSimple, GraduationCap, Lightning } from "@phosphor-icons/react";
import API_BASE_URL from "../../../config/api";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const StatusBadge = ({ status }) => {
  const cfg = { paid:{ bg:"#dcfce7",color:"#15803d",icon:"CHECK",text:"PAID" }, overdue:{ bg:"#fee2e2",color:"#b91c1c",icon:"WARN",text:"OVERDUE" }, pending:{ bg:"#fef9c3",color:"#92400e",icon:"TIME",text:"PENDING" } };
  const s = cfg[(status || "pending").toLowerCase()] || cfg.pending;
  const icons = { CHECK: <CheckCircle size={11} weight="fill" />, WARN: <Warning size={11} weight="fill" />, TIME: <CalendarBlank size={11} weight="fill" /> };
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:20, background:s.bg, color:s.color, fontWeight:800, fontSize:"0.72rem" }}>{icons[s.icon]} {s.text}</span>;
};

const StatCard = ({ label, value, icon, color, bg }) => (
  <div style={{ background:"white", borderRadius:16, padding:"1rem 1.2rem", border:"1.5px solid #f1f5f9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", display:"flex", alignItems:"center", gap:12 }}>
    <div style={{ background:bg, borderRadius:12, padding:10, color }}>{icon}</div>
    <div>
      <div style={{ fontSize:"1.1rem", fontWeight:900, color }}>{value}</div>
      <div style={{ fontSize:"0.7rem", color:"#94a3b8", fontWeight:600, textTransform:"uppercase" }}>{label}</div>
    </div>
  </div>
);

const FinFees = ({ challans = [], onAction, onEdit, isCollege = true }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [feeSubTab, setFeeSubTab] = useState("challans");
  const [admissionInquiries, setAdmissionInquiries] = useState([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genLoading, setGenLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayChallan, setSelectedPayChallan] = useState(null);
  const [payMethod, setPayMethod] = useState("Cash Counter");
  const [payingLoading, setPayingLoading] = useState(false);

  const inputSty = { padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"0.85rem", background:"#f8fafc", outline:"none", fontWeight:600, color:"#0f172a" };
  const labelSty = { display:"block", marginBottom:"6px", fontSize:"0.75rem", fontWeight:700, color:"#64748b", textTransform:"uppercase" };

  const fetchAdmissionInquiries = async () => {
    try { setAdmissionsLoading(true); const token = sessionStorage.getItem("token"); const res = await fetch(`${API_BASE_URL}/api/finance/admission-inquiries`,{ headers:{ "Authorization":`Bearer ${token}` } }); const data = await res.json(); if(data.success) setAdmissionInquiries(data.inquiries||[]); } catch(e){ console.error(e); } finally{ setAdmissionsLoading(false); }
  };
  useEffect(()=>{ fetchAdmissionInquiries(); },[]);

  const handleClearAdmissionFee = async (inquiryId) => {
    if(!window.confirm("Verify and mark admission fee as PAID?")) return;
    try { const token = sessionStorage.getItem("token"); const res = await fetch(`${API_BASE_URL}/api/finance/admission-clearance/${inquiryId}`,{ method:"PUT", headers:{ "Content-Type":"application/json","Authorization":`Bearer ${token}` }, body:JSON.stringify({ payment_method:"Finance Cash Desk" }) }); const data = await res.json(); if(data.success){ alert(data.message||"Fee verified!"); fetchAdmissionInquiries(); } else { alert(data.message||"Error"); } } catch(e){ alert("Failed"); }
  };

  const handleGenerateMonthlyChallans = async () => {
    setGenLoading(true);
    const success = await onAction("POST","/challans/generate-monthly",{ month:genMonth, year:genYear });
    setGenLoading(false);
    if(success) setShowGenModal(false);
  };

  const handleOpenPayModal = (c) => { setSelectedPayChallan(c); setShowPayModal(true); };

  const handleConfirmPayment = async () => {
    if(!selectedPayChallan) return;
    setPayingLoading(true);
    const success = await onAction("PUT",`/challans/${selectedPayChallan.id}/status`,{ status:"paid", payment_method:payMethod });
    setPayingLoading(false);
    if(success){ setShowPayModal(false); setSelectedPayChallan(null); }
  };

  const handlePrint3CopyChallan = (c) => {
    const pw = window.open("","_blank"); const mn = MONTHS[(c.fee_month||1)-1]||"Current";
    pw.document.write(`<html><head><title>Fee Voucher</title><style>body{font-family:sans-serif;padding:20px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1100px;margin:0 auto}.b{border:1.5px dashed #94a3b8;border-radius:12px;padding:16px;font-size:11px}.h{text-align:center;border-bottom:1px solid #cbd5e1;padding-bottom:8px;margin-bottom:8px}.t{font-size:13px;font-weight:900}.ct{display:inline-block;margin-top:4px;padding:2px 8px;border-radius:4px;background:#e2e8f0;font-weight:800;font-size:9px}.mr{display:flex;justify-content:space-between;padding:3px 0}.ml{color:#64748b}.mv{font-weight:700}.ft{width:100%;border-collapse:collapse;margin:10px 0}.ft td{padding:4px 0;border-bottom:1px solid #f1f5f9}.tr{font-weight:900;border-top:1px solid #cbd5e1}@media print{.np{display:none!important}}</style></head><body><div class="np" style="text-align:center;margin-bottom:20px"><button onclick="window.print()" style="padding:10px 24px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Print 3-Copy Voucher</button></div><div class="g">${["BANK COPY","COLLEGE ACCOUNTS COPY","PARENT / STUDENT COPY"].map(ti=>`<div class="b"><div class="h"><div class="t">LANCERS TECH COLLEGE</div><div style="font-size:10px;color:#64748b;font-weight:700">MONTHLY FEE VOUCHER</div><div class="ct">${ti}</div></div><div><div class="mr"><span class="ml">Challan No:</span><span class="mv">${c.challan_no||"SCH-"+c.id}</span></div><div class="mr"><span class="ml">Fee Month:</span><span class="mv">${mn} ${c.fee_year||new Date().getFullYear()}</span></div><div class="mr"><span class="ml">Due Date:</span><span class="mv" style="color:#b91c1c">${c.due_date?new Date(c.due_date).toLocaleDateString():"10th of Month"}</span></div><div class="mr"><span class="ml">Student:</span><span class="mv">${c.student_name||"Enrolled Student"}</span></div><div class="mr"><span class="ml">Roll No:</span><span class="mv">${c.roll_number||"---"}</span></div><div class="mr"><span class="ml">Class:</span><span class="mv" style="color:#4f46e5">${c.class_name||"Class Grade"}</span></div></div><table class="ft"><tr><td>Tuition Fee:</td><td style="text-align:right;font-weight:700">Rs. ${(parseFloat(c.tuition_fee)||0).toLocaleString()}</td></tr>${c.transport_fee>0?`<tr><td>Transport:</td><td style="text-align:right;font-weight:700">Rs. ${parseFloat(c.transport_fee).toLocaleString()}</td></tr>`:""}${c.computer_fee>0?`<tr><td>Computer Lab:</td><td style="text-align:right;font-weight:700">Rs. ${parseFloat(c.computer_fee).toLocaleString()}</td></tr>`:""}${c.accrued_late_fee>0?`<tr><td style="color:#b91c1c">Late Fine:</td><td style="text-align:right;font-weight:700;color:#b91c1c">+Rs. ${parseFloat(c.accrued_late_fee).toLocaleString()}</td></tr>`:""}  <tr class="tr"><td>TOTAL PAYABLE:</td><td style="text-align:right">Rs. ${(parseFloat(c.total_amount)||0).toLocaleString()}</td></tr></table></div>`).join("")}</div></body></html>`);
    pw.document.close();
  };

  const filteredChallans = challans.filter(c => {
    const ms = (c.student_name||"").toLowerCase().includes(searchTerm.toLowerCase())||(c.roll_number||"").toLowerCase().includes(searchTerm.toLowerCase())||(c.challan_no||"").toLowerCase().includes(searchTerm.toLowerCase());
    const mst = filterStatus==="all"||(c.status||"").toLowerCase()===filterStatus;
    const mc = filterClass==="all"||(c.class_name||"").toLowerCase()===filterClass.toLowerCase();
    return ms&&mst&&mc;
  });

  const uniqueClasses = Array.from(new Set(challans.map(c=>c.class_name).filter(Boolean)));
  const paidCount = challans.filter(c=>c.status==="paid").length;
  const pendingCount = challans.filter(c=>c.status==="pending").length;
  const overdueCount = challans.filter(c=>c.status==="overdue").length;
  const totalRevenue = challans.filter(c=>c.status==="paid").reduce((s,c)=>s+(parseFloat(c.total_amount)||0),0);
  const accentMap = { paid:"#4f46e5", overdue:"#ef4444", pending:"#f59e0b" };

  return (
    <div className="fin-animate">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h2 style={{ fontSize:"1.4rem", fontWeight:800, color:"#0f172a", margin:0, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius:12, padding:"8px 10px", display:"flex" }}><GraduationCap size={20} color="white" weight="fill" /></span>
            College Monthly Fee Register
          </h2>
          <div style={{ display:"inline-flex", background:"#f1f5f9", borderRadius:12, padding:4, gap:4, marginTop:10 }}>
            <button onClick={()=>setFeeSubTab("challans")} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:feeSubTab==="challans"?"white":"transparent", color:feeSubTab==="challans"?"#0f172a":"#64748b", fontWeight:700, fontSize:"0.82rem", cursor:"pointer", boxShadow:feeSubTab==="challans"?"0 1px 4px rgba(0,0,0,0.1)":"none", display:"flex", alignItems:"center", gap:6 }}>
              <Receipt size={14} weight="fill" /> Monthly Fee Register ({challans.length})
            </button>
            <button onClick={()=>{ setFeeSubTab("admissions"); fetchAdmissionInquiries(); }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:feeSubTab==="admissions"?"#4f46e5":"transparent", color:feeSubTab==="admissions"?"white":"#64748b", fontWeight:700, fontSize:"0.82rem", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <GraduationCap size={14} weight="fill" /> New Admission Fee Clearance
              {admissionInquiries.filter(a=>a.fee_status!=="paid").length>0&&(<span style={{ padding:"2px 6px", borderRadius:6, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:900 }}>{admissionInquiries.filter(a=>a.fee_status!=="paid").length}</span>)}
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={async()=>{ if(window.confirm("Calculate late fee fines for overdue challans?")) await onAction("POST","/challans/apply-late-fines"); }} style={{ padding:"10px 16px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", border:"none", borderRadius:10, fontSize:"0.85rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 12px rgba(239,68,68,0.25)" }}>
            <Warning size={16} weight="fill" /> Calculate Fines
          </button>
          <button onClick={()=>setShowGenModal(true)} style={{ padding:"10px 18px", background:"linear-gradient(135deg,#4f46e5,#818cf8)", color:"white", border:"none", borderRadius:10, fontSize:"0.85rem", fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 12px rgba(79,70,229,0.3)" }}>
            <Lightning size={16} weight="fill" /> Generate Monthly Dues
          </button>
        </div>
      </div>

      {/* Admission Tab */}
      {feeSubTab==="admissions"&&(
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", padding:"20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div><h3 style={{ margin:0, fontSize:"1.05rem", fontWeight:800, color:"#0f172a" }}>New Admission Fee Inquiries &amp; Clearance Desk</h3><p style={{ margin:"2px 0 0", fontSize:"0.8rem", color:"#64748b" }}>Verify admission fee payment and forward applicant to Principal.</p></div>
            <button onClick={fetchAdmissionInquiries} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid #cbd5e1", background:"#fff", cursor:"pointer", fontSize:"0.8rem", fontWeight:700, display:"flex", alignItems:"center", gap:6 }}><ArrowsClockwise size={14} /> Refresh</button>
          </div>
          {admissionsLoading?(<div style={{ textAlign:"center", padding:"40px", color:"#64748b" }}>Loading...</div>):admissionInquiries.length===0?(<div style={{ textAlign:"center", padding:"40px", color:"#94a3b8" }}>No admission inquiries found.</div>):(
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
              {admissionInquiries.map(inq=>(
                <div key={inq.id} style={{ background:"#f8fafc", borderRadius:14, padding:"1.2rem", border:"1.5px solid #e2e8f0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div><div style={{ fontWeight:800, color:"#0f172a", fontSize:"0.95rem" }}>{inq.full_name}</div><div style={{ fontSize:"0.8rem", color:"#64748b" }}>{inq.father_name||"---"}</div></div>
                    {inq.fee_status==="paid"?(<span style={{ padding:"4px 10px", borderRadius:20, background:"#dcfce7", color:"#15803d", fontWeight:800, fontSize:"0.72rem" }}>CHECK PAID</span>):(<span style={{ padding:"4px 10px", borderRadius:20, background:"#fef9c3", color:"#92400e", fontWeight:800, fontSize:"0.72rem" }}>PENDING</span>)}
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                    <span style={{ padding:"3px 8px", borderRadius:6, background:"#eef2ff", color:"#4f46e5", fontWeight:700, fontSize:"0.78rem" }}>{inq.target_class||inq.program}</span>
                    <span style={{ padding:"3px 8px", borderRadius:6, background:"#f1f5f9", color:"#64748b", fontWeight:600, fontSize:"0.78rem" }}>{inq.campus_name||"Main Campus"}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontWeight:900, fontSize:"1.1rem", color:"#0f172a" }}>Rs. {(inq.admission_fee||5000).toLocaleString()}</div>
                    {inq.fee_status!=="paid"?(<button onClick={()=>handleClearAdmissionFee(inq.id)} style={{ padding:"7px 14px", borderRadius:8, border:"none", background:"#10b981", color:"#fff", fontWeight:800, fontSize:"0.78rem", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><CheckCircle size={14} weight="fill" /> Clear Fee</button>):(<span style={{ color:"#0284c7", fontWeight:700, fontSize:"0.78rem" }}>In Principal Review</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challans Tab */}
      {feeSubTab==="challans"&&(
        <>
          {challans.length>0&&(
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
              <StatCard label="Total Challans" value={challans.length} color="#4f46e5" bg="#eef2ff" icon={<Receipt size={20} weight="fill" />} />
              <StatCard label="Paid" value={paidCount} color="#15803d" bg="#dcfce7" icon={<CheckCircle size={20} weight="fill" />} />
              <StatCard label="Pending" value={pendingCount} color="#92400e" bg="#fef9c3" icon={<CalendarBlank size={20} weight="fill" />} />
              <StatCard label="Overdue" value={overdueCount} color="#b91c1c" bg="#fee2e2" icon={<Warning size={20} weight="fill" />} />
              <StatCard label="Revenue Collected" value={`Rs. ${totalRevenue.toLocaleString()}`} color="#059669" bg="#f0fdf4" icon={<CurrencyDollar size={20} weight="fill" />} />
            </div>
          )}
          {/* Filters */}
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20, flexWrap:"wrap", background:"white", padding:"14px 16px", borderRadius:14, border:"1.5px solid #f1f5f9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <FunnelSimple size={18} color="#94a3b8" />
            <div style={{ flex:1, minWidth:"200px", position:"relative" }}>
              <MagnifyingGlass size={16} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
              <input type="text" placeholder="Search student, roll no, or challan #..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ ...inputSty, width:"100%", paddingLeft:36, boxSizing:"border-box" }} />
            </div>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ ...inputSty, minWidth:160 }}>
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid Challans</option>
              <option value="pending">Pending Challans</option>
              <option value="overdue">Overdue Defaulters</option>
            </select>
            {uniqueClasses.length>0&&(<select value={filterClass} onChange={e=>setFilterClass(e.target.value)} style={{ ...inputSty, minWidth:140 }}><option value="all">All Classes</option>{uniqueClasses.map(cls=><option key={cls} value={cls}>{cls}</option>)}</select>)}
          </div>
          {/* Cards Grid */}
          {filteredChallans.length===0?(
            <div style={{ textAlign:"center", padding:"80px", background:"white", borderRadius:20, border:"2px dashed #e2e8f0" }}>
              <Receipt size={56} style={{ opacity:0.2, marginBottom:16, color:"#4f46e5" }} />
              <p style={{ fontSize:"1.1rem", fontWeight:700, color:"#334155", margin:"0 0 8px" }}>No Fee Challans Found</p>
              <p style={{ fontSize:"0.85rem", color:"#94a3b8", margin:"0 0 20px" }}>Click "Generate Monthly Dues" to generate challans.</p>
              <button onClick={()=>setShowGenModal(true)} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#4f46e5,#6366f1)", color:"white", border:"none", borderRadius:12, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 }}><Lightning size={16} weight="fill" /> Generate Challans</button>
            </div>
          ):(
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:"1rem" }}>
              {filteredChallans.map(c=>{
                const addons=(parseFloat(c.transport_fee)||0)+(parseFloat(c.computer_fee)||0)+(parseFloat(c.activity_fee)||0)+(parseFloat(c.accrued_late_fee)||0);
                const accent=accentMap[(c.status||"pending").toLowerCase()]||"#f59e0b";
                return(
                  <div key={c.id} style={{ background:"white", borderRadius:18, border:"1.5px solid #f1f5f9", boxShadow:"0 4px 16px rgba(0,0,0,0.05)", overflow:"hidden", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 28px rgba(79,70,229,0.12)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.05)"}>
                    <div style={{ height:4, background:`linear-gradient(90deg,${accent},${accent}66)` }} />
                    <div style={{ padding:"1.1rem 1.2rem" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ background:"#eef2ff", borderRadius:10, padding:8, color:"#4f46e5" }}><Student size={18} weight="fill" /></div>
                          <div><div style={{ fontWeight:800, color:"#0f172a", fontSize:"0.92rem" }}>{c.student_name||"Enrolled Student"}</div><div style={{ fontSize:"0.75rem", color:"#94a3b8", fontWeight:600 }}>Roll: {c.roll_number||"---"}</div></div>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
                        {[["Challan No",c.challan_no||`SCH-${c.id}`,"#334155"],["Class / Grade",c.class_name||c.program_name||"---","#4f46e5"],["Fee Month",`${MONTHS[(c.fee_month||1)-1]} ${c.fee_year||new Date().getFullYear()}`,"#334155"],["Due Date",c.due_date?new Date(c.due_date).toLocaleDateString():"---",c.status==="overdue"?"#b91c1c":"#334155"]].map(([k,v,vc])=>(
                          <div key={k} style={{ background:"#f8fafc", borderRadius:8, padding:"6px 10px" }}>
                            <div style={{ fontSize:"0.62rem", color:"#94a3b8", fontWeight:700, textTransform:"uppercase" }}>{k}</div>
                            <div style={{ fontSize:"0.78rem", fontWeight:800, color:vc }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:"linear-gradient(135deg,#eef2ff,#e0e7ff)", borderRadius:10, padding:"10px 12px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div><div style={{ fontSize:"0.65rem", color:"#6366f1", fontWeight:700 }}>TUITION</div><div style={{ fontSize:"0.95rem", fontWeight:800, color:"#4f46e5" }}>Rs. {(parseFloat(c.tuition_fee)||0).toLocaleString()}</div></div>
                        {addons>0&&(<div style={{ textAlign:"center" }}><div style={{ fontSize:"0.65rem", color:"#d97706", fontWeight:700 }}>ADD-ONS</div><div style={{ fontSize:"0.85rem", fontWeight:700, color:"#d97706" }}>+Rs. {addons.toLocaleString()}</div></div>)}
                        <div style={{ textAlign:"right" }}><div style={{ fontSize:"0.65rem", color:"#059669", fontWeight:700 }}>TOTAL DUE</div><div style={{ fontSize:"1.05rem", fontWeight:900, color:"#059669" }}>Rs. {(parseFloat(c.total_amount)||0).toLocaleString()}</div></div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {c.status!=="paid"&&(<button onClick={()=>handleOpenPayModal(c)} style={{ flex:1, padding:"8px", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:"0.8rem", fontWeight:700 }}><CurrencyDollar size={15} weight="fill" /> Collect</button>)}
                        <button onClick={()=>handlePrint3CopyChallan(c)} style={{ flex:1, padding:"8px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:"0.8rem", fontWeight:700, color:"#334155" }}><Printer size={15} weight="duotone" /> Print</button>
                        <button onClick={()=>onAction("POST",`/challans/${c.id}/remind`)} style={{ padding:"8px 10px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center" }} title="Send Reminder"><Envelope size={15} weight="duotone" color="#64748b" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Generate Modal */}
      {showGenModal&&(
        <div style={{ position:"fixed", inset:0, zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,23,42,0.65)", backdropFilter:"blur(4px)" }}>
          <div style={{ background:"white", borderRadius:20, padding:"28px", width:"90%", maxWidth:"480px", boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ background:"linear-gradient(135deg,#4f46e5,#818cf8)", borderRadius:12, padding:10, color:"white" }}><Lightning size={18} weight="fill" /></div><h3 style={{ fontSize:"1.1rem", fontWeight:800, color:"#0f172a", margin:0 }}>Auto-Generate Monthly College Dues</h3></div>
              <button onClick={()=>setShowGenModal(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"6px", cursor:"pointer", display:"flex" }}><X size={16} weight="bold" /></button>
            </div>
            <p style={{ fontSize:"0.82rem", color:"#64748b", marginBottom:20, lineHeight:1.5 }}>Calculates Tuition, Transport, Computer &amp; Activity fees based on each grade fee structure and generates printable 3-copy challans for all enrolled students.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <div><label style={labelSty}>Billing Month</label><select value={genMonth} onChange={e=>setGenMonth(parseInt(e.target.value))} style={{ ...inputSty, width:"100%", boxSizing:"border-box" }}>{MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</select></div>
              <div><label style={labelSty}>Billing Year</label><select value={genYear} onChange={e=>setGenYear(parseInt(e.target.value))} style={{ ...inputSty, width:"100%", boxSizing:"border-box" }}>{[2025,2026,2027,2028].map(y=><option key={y} value={y}>{y}</option>)}</select></div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button onClick={()=>setShowGenModal(false)} style={{ padding:"10px 18px", background:"white", border:"1px solid #cbd5e1", color:"#64748b", borderRadius:12, fontWeight:700, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleGenerateMonthlyChallans} disabled={genLoading} style={{ padding:"10px 22px", background:"linear-gradient(135deg,#4f46e5,#818cf8)", border:"none", color:"white", borderRadius:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:genLoading?0.7:1 }}><Check size={16} weight="bold" /> {genLoading?"Generating...":"Generate Monthly Dues"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal&&selectedPayChallan&&(
        <div style={{ position:"fixed", inset:0, zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,23,42,0.65)", backdropFilter:"blur(4px)" }}>
          <div style={{ background:"white", borderRadius:20, padding:"28px", width:"90%", maxWidth:"440px", boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ background:"linear-gradient(135deg,#10b981,#059669)", borderRadius:12, padding:10, color:"white" }}><CurrencyDollar size={18} weight="fill" /></div><h3 style={{ fontSize:"1.1rem", fontWeight:800, color:"#0f172a", margin:0 }}>Fee Payment Collection</h3></div>
              <button onClick={()=>setShowPayModal(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"6px", cursor:"pointer", display:"flex" }}><X size={16} weight="bold" /></button>
            </div>
            <div style={{ background:"#f8fafc", padding:16, borderRadius:12, border:"1px solid #e2e8f0", marginBottom:18, fontSize:"0.85rem", display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ color:"#64748b" }}>Student:</span><strong>{selectedPayChallan.student_name}</strong></div>
              <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ color:"#64748b" }}>Class &amp; Roll:</span><strong>{selectedPayChallan.class_name||"Class"} (Roll: {selectedPayChallan.roll_number||"---"})</strong></div>
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #e2e8f0", paddingTop:10, marginTop:4, fontSize:"1rem", fontWeight:900 }}><span>Total Amount Due:</span><span style={{ color:"#15803d" }}>Rs. {(parseFloat(selectedPayChallan.total_amount)||0).toLocaleString()}</span></div>
            </div>
            <div style={{ marginBottom:20 }}><label style={labelSty}>Payment Mode</label><select value={payMethod} onChange={e=>setPayMethod(e.target.value)} style={{ ...inputSty, width:"100%", boxSizing:"border-box" }}><option value="Cash Counter">Cash at Counter</option><option value="Bank Deposit Slip">Bank Deposit Challan</option><option value="Online / Mobile Banking">Online Banking Transfer</option></select></div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button onClick={()=>setShowPayModal(false)} style={{ padding:"10px 16px", background:"white", border:"1px solid #cbd5e1", color:"#64748b", borderRadius:12, fontWeight:700, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleConfirmPayment} disabled={payingLoading} style={{ padding:"10px 22px", background:"linear-gradient(135deg,#10b981,#059669)", border:"none", color:"white", borderRadius:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:payingLoading?0.7:1 }}><CheckCircle size={18} weight="fill" /> {payingLoading?"Processing...":"Mark Fee as PAID"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinFees;
