# Lancers Tech Admissions Portal UI Design Prompt

Use this prompt in DeepSeek or any LLM to generate the high-end UI for the Admissions Portal.

---

## 1. Design Aesthetic: "Elite Institutional"
- **Color Palette:**
  - Primary: `#4f46e5` (Indigo)
  - Sidebar: `#0f172a` (Deep Navy)
  - Background: `#f8fafc` (Light Gray/Blue)
  - Text: `#1e293b` (Main), `#64748b` (Muted)
- **Typography:** Inter (Primary), Plus Jakarta Sans (Logo/Headers). Base font 14px-15px.
- **Components:** Rounded corners (16px-24px), subtle box-shadows, high-density data tables.

## 2. Layout Structure (Modular Architecture)
The dashboard must be built using a parent orchestrator (`AdmissionsDashboard.jsx`) and five discrete sub-sections in the `sections/` folder:

1. **Overview (`AdmissionsOverview.jsx`):** 
   - 4 Metric cards (Total Leads, New Applications, Interviewed, Admitted).
   - A conversion funnel visualization (Vertical bars).
   - Recent activity list.
2. **Pipeline (`AdmissionsPipeline.jsx`):** 
   - A Kanban-style or high-end list view showing applicants in stages: *Lead -> Applied -> Interview -> Merit List -> Admitted*.
3. **Document Verification (`AdmissionsVerification.jsx`):** 
   - Table for verifying academic transcripts, ID cards, and photographs.
   - Status badges: `Pending`, `Verified`, `Rejected`.
4. **Merit List Manager (`AdmissionsMeritList.jsx`):** 
   - Interface to generate and publish merit lists based on scores.
5. **Interview Schedule (`AdmissionsInterviews.jsx`):** 
   - A list/calendar view of upcoming interviews.

## 3. Sidebar Requirements
- **Logo Section:** "LancersTech" (Indigo accent on 'Tech'). Subtitle: "Admissions Office".
- **Navigation Items:** Pipeline, Applicants, Verification, Merit List, Interviews.
- **Bottom Section:** A persistent "Sign Out" button with a red hover effect.

## 4. Coding Standard
- Use **Phosphor Icons** (`@phosphor-icons/react`).
- CSS should use **Vanilla CSS** with CSS Variables defined in `:root`.
- The dashboard must be **fully responsive** (mobile hamburger menu + overlay).
- Match the layout of the `RegistrarDashboard.jsx` (280px sidebar, clean top-header with user pill).

---

### UI Reference Points:
- Use `RegistrarDashboard.jsx` and `registrar.css` as the "Gold Standard" for layout and styling.
- Ensure the header is clean: `Institutional Admissions` title on the left, Bell icon and User Pill on the right.
