import {
  createInitialState, normalizeState, activeUser, activePlan, resolveDay, deletePlan,
  nextSetDefaults, previousWeekExercise, localDateKey, dateFromKey, uid, presetPlan,
  CARDIO, sessionStats, chartSeries, reportData, calculateOneRM, escapeHTML, restDay,
} from "./core.js";
import { loadState, saveState, requestPersistentStorage, isStoragePersistent } from "./db.js";
import { svgIcon, cardioIcon, categoryIcon } from "./icons.js";

const I18N = {
  th: {
    today:"วันนี้", plans:"แผน", history:"ประวัติ", progress:"พัฒนาการ", settings:"ตั้งค่า",
    ready:"พร้อมฝึก", rest:"วันพัก", strength:"เวท", cardio:"คาร์ดิโอ", start:"เริ่มฝึก", finish:"จบการฝึก",
    noPlan:"ยังไม่มีท่าที่ต้องเล่น", addExercise:"เพิ่มท่า", editDay:"แก้ไขวันนี้", previous:"สัปดาห์ก่อน",
    noData:"ยังไม่มีข้อมูล", weight:"น้ำหนัก", reps:"ครั้ง", set:"เซต", record:"บันทึกเซต", warmup:"วอร์มอัพ",
    reduce:"หนักไป ลด", maintain:"คงไว้ก่อน", increase:"ดี เพิ่มครั้งหน้า", done:"เล่นแล้ว", planned:"เป้าหมาย",
    calories:"พลังงาน", duration:"เวลา", volume:"ปริมาณยก", sessions:"ครั้งฝึก", minutes:"นาที", kg:"กก.", kcal:"kcal",
    todayOnly:"เปลี่ยนเฉพาะวันนี้", permanent:"เปลี่ยนในแผนถาวร", save:"บันทึก", cancel:"ยกเลิก", delete:"ลบ",
    newPlan:"สร้างแผน", usePlan:"ใช้แผนนี้", active:"ใช้อยู่", weeklyPlan:"ตารางสัปดาห์", choosePreset:"เลือกแผนเริ่มต้น",
    lean:"Lean Plan", build:"Build Plan", custom:"ตั้งเอง", planName:"ชื่อแผน", deletePlan:"ลบแผน",
    report:"รายงาน", weekly:"รายสัปดาห์", monthly:"รายเดือน", printPDF:"ดู / บันทึก PDF", bestLifts:"ผลงานเด่น",
    language:"ภาษา", appearance:"การแสดงผล", system:"ตามเครื่อง", light:"สว่าง", dark:"มืด", color:"โทนสี",
    cool:"เย็น", warm:"ร้อน", forest:"ธรรมชาติ", mono:"เรียบ", profiles:"ผู้ใช้งาน", addUser:"เพิ่มผู้ใช้",
    bodyWeight:"น้ำหนักตัว", backup:"สำรองข้อมูล", export:"ดาวน์โหลดสำรอง", import:"กู้คืนข้อมูล", storage:"เก็บข้อมูลระยะยาว",
    storageOn:"ป้องกันการล้างข้อมูลแล้ว", storageOff:"ขออนุญาตเก็บถาวร", privacy:"ข้อมูลทั้งหมดอยู่ในอุปกรณ์นี้ ไม่มีบัญชีและไม่มีการส่งข้อมูลออก",
    install:"ติดตั้งบน iPhone", installHelp:"เปิดด้วย Safari → แชร์ → เพิ่มไปยังหน้าจอโฮม", notes:"โน้ต", distance:"ระยะทาง (กม.)",
    speed:"ความเร็ว (กม./ชม.)", incline:"ความชัน (%)", activity:"กิจกรรม", treadmill:"ลู่วิ่ง", summary:"สรุป",
    currentPlan:"แผนปัจจุบัน", date:"วันที่", all:"ทั้งหมด", topWeight:"น้ำหนักสูงสุด", estimated1RM:"1RM โดยประมาณ",
    chooseExercise:"เลือกท่า", changeMode:"เปลี่ยนรูปแบบวันนี้", emptyHistory:"บันทึกการฝึกครั้งแรก แล้วข้อมูลจะอยู่ที่นี่",
    confirmDelete:"ยืนยันการลบ", cannotDelete:"ต้องเหลืออย่างน้อย 1 แผน", imported:"กู้คืนข้อมูลแล้ว", exported:"ดาวน์โหลดข้อมูลแล้ว",
    copied:"บันทึกแล้ว", userName:"ชื่อผู้ใช้", sessionStarted:"เริ่มจับเวลาการฝึกแล้ว", sessionFinished:"บันทึกการฝึกแล้ว",
  },
  en: {
    today:"Today", plans:"Plans", history:"History", progress:"Progress", settings:"Settings",
    ready:"Ready to train", rest:"Rest day", strength:"Strength", cardio:"Cardio", start:"Start workout", finish:"Finish workout",
    noPlan:"No exercises planned", addExercise:"Add exercise", editDay:"Edit today", previous:"Last week",
    noData:"No data yet", weight:"Weight", reps:"Reps", set:"Set", record:"Log set", warmup:"Warm-up",
    reduce:"Too heavy", maintain:"Maintain", increase:"Increase next time", done:"Done", planned:"Target",
    calories:"Energy", duration:"Duration", volume:"Volume", sessions:"Workouts", minutes:"min", kg:"kg", kcal:"kcal",
    todayOnly:"Change today only", permanent:"Update plan permanently", save:"Save", cancel:"Cancel", delete:"Delete",
    newPlan:"New plan", usePlan:"Use this plan", active:"Active", weeklyPlan:"Weekly schedule", choosePreset:"Choose a starting plan",
    lean:"Lean Plan", build:"Build Plan", custom:"Custom", planName:"Plan name", deletePlan:"Delete plan",
    report:"Report", weekly:"Weekly", monthly:"Monthly", printPDF:"View / Save PDF", bestLifts:"Best lifts",
    language:"Language", appearance:"Appearance", system:"System", light:"Light", dark:"Dark", color:"Color theme",
    cool:"Cool", warm:"Warm", forest:"Forest", mono:"Minimal", profiles:"Profiles", addUser:"Add profile",
    bodyWeight:"Body weight", backup:"Backup", export:"Download backup", import:"Restore backup", storage:"Long-term storage",
    storageOn:"Persistent storage is active", storageOff:"Protect local storage", privacy:"All data stays on this device. No account and no data upload.",
    install:"Install on iPhone", installHelp:"Open in Safari → Share → Add to Home Screen", notes:"Notes", distance:"Distance (km)",
    speed:"Speed (km/h)", incline:"Incline (%)", activity:"Activity", treadmill:"Treadmill", summary:"Summary",
    currentPlan:"Current plan", date:"Date", all:"All", topWeight:"Top weight", estimated1RM:"Estimated 1RM",
    chooseExercise:"Choose exercise", changeMode:"Change today's mode", emptyHistory:"Log your first workout and it will appear here.",
    confirmDelete:"Confirm delete", cannotDelete:"Keep at least one plan", imported:"Backup restored", exported:"Backup downloaded",
    copied:"Saved", userName:"Profile name", sessionStarted:"Workout timer started", sessionFinished:"Workout saved",
  }
};

let state;
let route = "today";
let reportPeriod = "week";
let reportAnchor = new Date();
let progressMetric = "weight";
let progressExercise = "bench-press";
let persistence = false;
let selectedPlanId = null;

const root = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const t = key => I18N[state?.settings?.language || "th"][key] || key;
const user = () => activeUser(state);
const lang = () => state.settings.language;
const exerciseName = id => {
  const ex = user().exercises.find(x => x.id === id);
  return ex ? (lang() === "th" ? ex.nameTh || ex.name : ex.name) : id;
};
const dayNames = () => lang() === "th" ? ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmt = (n, max = 0) => new Intl.NumberFormat(lang() === "th" ? "th-TH" : "en-US", { maximumFractionDigits:max }).format(Number(n) || 0);
const dateFmt = (date, opts = { weekday:"long", day:"numeric", month:"long" }) => new Intl.DateTimeFormat(lang() === "th" ? "th-TH" : "en-US", opts).format(date);

async function persist(render = false) {
  await saveState(state);
  applyTheme();
  if (render) draw();
}

function applyTheme() {
  const setting = state.settings.appearance;
  const dark = setting === "dark" || (setting === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.mode = dark ? "dark" : "light";
  document.documentElement.dataset.theme = state.settings.theme;
  document.documentElement.lang = lang();
  document.querySelector('meta[name="theme-color"]').content = dark ? "#0d1419" : ({cool:"#173b57",warm:"#7d3420",forest:"#204c3c",mono:"#20262c"}[state.settings.theme]);
}

function toast(message) {
  const el = document.querySelector("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 1800);
}

function icon(kind, size = 20) { return svgIcon(kind, size); }

function shell(content) {
  const nav = ["today","plans","history","progress","settings"];
  return `<main class="shell">
    <header class="topbar"><div class="brand"><div class="mark">L</div><strong>LiftLog</strong></div><button class="profile-chip" data-action="profiles">${escapeHTML(user().name)}⌄</button></header>
    ${content}
    <nav class="bottom-nav" aria-label="Main">${nav.map(item => `<button data-route="${item}" class="${route===item?"active":""}"><span class="nav-icon">${icon(item,21)}</span><span>${t(item)}</span></button>`).join("")}</nav>
  </main>`;
}

function pageHead(title, eyebrow = "LiftLog", action = "") {
  return `<div class="page-head row"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1></div>${action}</div>`;
}

function renderToday() {
  const now = new Date(); const resolved = resolveDay(user(), now); const plan = resolved.plan; const day = resolved.day;
  const active = user().activeSession;
  let body = pageHead(t("today"), dateFmt(now), `<button class="icon-btn" data-action="edit-day" aria-label="${t("editDay")}">${icon("edit")}</button>`);
  body += `<section class="card hero"><div class="hero-row"><div><div class="muted small">${t("currentPlan")}</div><h2>${escapeHTML(plan?.name || "—")}</h2></div><span class="pill">${icon(day.mode)} ${t(day.mode)}</span></div>
    ${resolved.overridden ? `<p class="small">${t("todayOnly")}</p>` : ""}
    <div class="grid-2" style="margin-top:16px"><div class="metric"><b>${day.mode === "strength" ? (day.exercises?.length || 0) : day.mode === "cardio" ? (day.cardio?.minutes || 0) : "—"}</b><span>${day.mode === "strength" ? t("addExercise") : day.mode === "cardio" ? t("minutes") : t("rest")}</span></div><div class="metric"><b>${active ? elapsed(active.startedAt) : "—"}</b><span>${t("duration")}</span></div></div>
    ${day.mode !== "rest" ? `<button class="btn with-icon" style="width:100%;margin-top:14px;background:#fff;color:var(--accent-2)" data-action="${active ? "finish-session" : "start-session"}">${icon(active?"check":"play",18)}${active ? t("finish") : t("start")}</button>` : ""}
  </section>`;
  if (day.mode === "rest") body += `<section class="card empty section"><div class="empty-icon">${icon("rest",34)}</div><h2>${t("rest")}</h2><p>${lang()==="th"?"ฟื้นฟูร่างกาย แล้วกลับมาแข็งแรงกว่าเดิม":"Recover today and come back stronger."}</p><button class="btn ghost with-icon" data-action="edit-day">${icon("edit",18)}${t("changeMode")}</button></section>`;
  else if (day.mode === "cardio") body += renderCardio(day);
  else body += renderStrength(day, active);
  return shell(body);
}

function elapsed(startedAt) {
  if (!startedAt) return "—";
  const m = Math.max(0, Math.floor((Date.now() - new Date(startedAt)) / 60000)); return `${m} ${t("minutes")}`;
}

function renderStrength(day, session) {
  const exercises = day.exercises || [];
  if (!exercises.length) return `<section class="card empty section"><div class="empty-icon">＋</div><h2>${t("noPlan")}</h2><button class="btn" data-action="edit-day">${t("addExercise")}</button></section>`;
  return `<section class="section"><div class="section-head"><h2>${lang()==="th"?"ท่าที่ต้องเล่น":"Today's exercises"}</h2><span class="muted small">${exercises.length} ${lang()==="th"?"ท่า":"exercises"}</span></div><div class="stack">${exercises.map((item, i) => strengthCard(item, i, session)).join("")}</div></section>`;
}

function strengthCard(item, index, session) {
  const exercise = user().exercises.find(x=>x.id===item.exerciseId);
  const previous = previousWeekExercise(user(), item.exerciseId);
  const sets = (session?.sets || []).filter(s => s.exerciseId === item.exerciseId);
  const defaults = nextSetDefaults(session, item);
  const feedback = session?.feedback?.[item.exerciseId];
  const complete = sets.filter(s=>!s.warmup).length >= item.sets;
  return `<article class="card exercise">
    <div class="exercise-main"><div class="exercise-title"><div class="exercise-index">${complete?icon("check",18):index+1}</div><div class="exercise-symbol">${categoryIcon(exercise?.category)}</div><div style="min-width:0;flex:1"><div class="row"><h3>${escapeHTML(exerciseName(item.exerciseId))}</h3>${complete?`<span class="badge good">${icon("check",14)}${t("done")}</span>`:""}</div><div class="muted small">${t("planned")}: ${item.sets} × ${item.repsBySet.join(" / ")} · ${fmt(item.weight,1)} ${t("kg")}</div></div></div>
    <div class="previous">${t("previous")}: ${previous ? `<b>${fmt(previous.weight,1)} ${t("kg")}</b> · ${previous.reps} ${t("reps")}` : t("noData")}</div>
    <form class="set-entry" data-form="set" data-exercise="${item.exerciseId}"><div class="field"><label>${t("weight")} (${t("kg")})</label><input name="weight" type="number" min="0" step="0.5" value="${defaults.weight}" ${session?"":"disabled"}></div><div class="field"><label>${t("set")} ${defaults.setNumber} · ${t("reps")}</label><input name="reps" type="number" min="1" step="1" value="${defaults.reps}" ${session?"":"disabled"}></div><button class="btn icon-only" aria-label="${t("record")}" ${session?"":"disabled"}>${icon("plus")}</button></form>
    <label class="small muted" style="display:flex;align-items:center;gap:6px;margin-top:9px"><input name="warmup" form="" type="checkbox" data-warmup="${item.exerciseId}" style="width:18px;min-height:18px">${t("warmup")}</label></div>
    ${sets.length ? `<div class="set-list">${sets.map((set,i)=>`<div class="set-row"><span class="set-number">${set.warmup?"W":i+1}</span><span><b>${fmt(set.weight,1)} ${t("kg")}</b> × ${set.reps}</span><button class="icon-btn" data-action="delete-set" data-set="${set.id}" aria-label="${t("delete")}">${icon("trash",17)}</button></div>`).join("")}</div>`:""}
    ${session ? `<div class="performance">${[["reduce",t("reduce")],["maintain",t("maintain")],["increase",t("increase")]].map(([key,label])=>`<button data-action="feedback" data-exercise="${item.exerciseId}" data-value="${key}" class="${feedback===key?"active":""}">${label}</button>`).join("")}</div>`:""}
  </article>`;
}

function renderCardio(day) {
  const c = day.cardio || {};
  const current = user().activeSession;
  return `<section class="section"><div class="section-head"><h2 class="title-icon">${cardioIcon(current?.activity||c.activity||"walking")} ${t("cardio")}</h2></div><form class="card stack" data-form="cardio">
    <div class="field"><label>${t("activity")}</label><select name="activity">${Object.entries(CARDIO).map(([key,v])=>`<option value="${key}" ${(current?.activity||c.activity)===key?"selected":""}>${lang()==="th"?v.th:v.en}</option>`).join("")}</select></div>
    <div class="grid-2"><div class="field"><label>${t("duration")} (${t("minutes")})</label><input name="minutes" type="number" min="1" value="${current?.minutes||c.minutes||30}"></div><div class="field"><label>${t("distance")}</label><input name="distance" type="number" min="0" step="0.1" value="${current?.distance||c.distance||0}"></div></div>
    <label class="row" style="justify-content:flex-start"><input name="treadmill" type="checkbox" style="width:20px;min-height:20px" ${(current?.treadmill??c.treadmill)?"checked":""}> ${t("treadmill")}</label>
    <div class="grid-2"><div class="field"><label>${t("speed")}</label><input name="speed" type="number" min="0" step="0.1" value="${current?.speed||c.speed||5}"></div><div class="field"><label>${t("incline")}</label><input name="incline" type="number" min="0" step="0.5" value="${current?.incline||c.incline||0}"></div></div>
    <div class="field"><label>${t("notes")}</label><textarea name="note" rows="2">${escapeHTML(current?.note||"")}</textarea></div>
    ${current?`<button class="btn">${t("save")}</button>`:`<div class="notice">${lang()==="th"?"กดเริ่มฝึกก่อนบันทึกผล":"Start the workout before saving results."}</div>`}
  </form></section>`;
}

function renderPlans() {
  const current = user().programs.find(p => p.id === selectedPlanId) || activePlan(user());
  let body = pageHead(t("plans"), t("weeklyPlan"), `<button class="btn small-btn with-icon" data-action="new-plan">${icon("plus",17)}${t("newPlan")}</button>`);
  body += `<div class="segmented" style="margin-bottom:14px">${user().programs.map(p=>`<button data-action="select-plan" data-plan="${p.id}" class="${p.id===current.id?"active":""}>${escapeHTML(p.name)}</button>`).join("")}</div>`;
  body += `<section class="card"><div class="row"><div><span class="badge ${current.id===user().activeProgramId?"good":""}">${current.id===user().activeProgramId?icon("check",14):icon("plans",14)}${current.id===user().activeProgramId?t("active"):t("plans")}</span><h2 style="margin-top:7px">${escapeHTML(current.name)}</h2></div><button class="icon-btn" data-action="rename-plan" aria-label="${t("planName")}">${icon("edit")}</button></div><hr>
    ${[1,2,3,4,5,6,0].map(dayIndex => { const d=current.days[dayIndex]||restDay(); const detail=d.mode==="strength"?`${d.exercises?.length||0} ${lang()==="th"?"ท่า":"exercises"}`:d.mode==="cardio"?`${CARDIO[d.cardio?.activity]?.[lang()==="th"?"th":"en"]||""} · ${d.cardio?.minutes||0} ${t("minutes")}`:t("rest"); return `<div class="day-row"><div class="day-name">${dayNames()[dayIndex]}</div><div class="day-detail"><span class="mode-symbol">${d.mode==="cardio"?cardioIcon(d.cardio?.activity):icon(d.mode)}</span><div><b>${t(d.mode)}</b><div class="muted small">${detail}</div></div></div><button class="icon-btn" data-action="edit-plan-day" data-day="${dayIndex}" aria-label="${t("editDay")}">${icon("chevron")}</button></div>`; }).join("")}
  </section><div class="grid-2 section"><button class="btn ${current.id===user().activeProgramId?"secondary":""} with-icon" data-action="activate-plan" ${current.id===user().activeProgramId?"disabled":""}>${icon("check",18)}${current.id===user().activeProgramId?t("active"):t("usePlan")}</button><button class="btn danger with-icon" data-action="delete-plan">${icon("trash",18)}${t("deletePlan")}</button></div>`;
  return shell(body);
}

function renderHistory() {
  const sessions = [...user().sessions].sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
  let body = pageHead(t("history"), t("sessions"));
  if (!sessions.length) body += `<section class="card empty"><div class="empty-icon">${icon("history",34)}</div><h2>${t("noData")}</h2><p>${t("emptyHistory")}</p></section>`;
  else body += `<section class="card">${sessions.map(s=>{const d=new Date(s.startedAt), stats=sessionStats(s); return `<div class="session-row"><div class="date-box"><b>${d.getDate()}</b><span>${dateFmt(d,{month:"short"})}</span></div><div><h3 class="title-icon">${s.kind==="strength"?icon("strength",17):cardioIcon(s.activity)} ${s.kind==="strength"?(s.planName||t("strength")):(CARDIO[s.activity]?.[lang()==="th"?"th":"en"]||t("cardio"))}</h3><div class="muted small">${s.kind==="strength"?`${stats.sets} ${t("set")} · ${fmt(stats.volume)} ${t("kg")}`:`${fmt(stats.duration)} ${t("minutes")} · ${fmt(s.distance,1)} km`}</div></div><div style="text-align:right"><b>${fmt(stats.calories)}</b><div class="muted small">${t("kcal")}</div><button class="icon-btn danger-icon" data-action="delete-session" data-session="${s.id}" style="margin-top:6px" aria-label="${t("delete")}">${icon("trash",16)}</button></div></div>`}).join("")}</section>`;
  return shell(body);
}

function lineChart(points) {
  if (!points.length) return `<div class="empty"><div class="empty-icon">${icon("progress",34)}</div>${t("noData")}</div>`;
  const W=620,H=260,p=30, vals=points.map(x=>x.value), min=Math.min(...vals),max=Math.max(...vals),span=max-min||1;
  const coords=points.map((x,i)=>({x:p+(i/(Math.max(1,points.length-1)))*(W-p*2),y:H-p-((x.value-min)/span)*(H-p*2),...x}));
  const path=coords.map((c,i)=>`${i?"L":"M"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area=`${path} L${coords.at(-1).x},${H-p} L${coords[0].x},${H-p} Z`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--surface)"/></linearGradient></defs>${[0,.25,.5,.75,1].map(n=>`<line class="grid" x1="${p}" x2="${W-p}" y1="${p+n*(H-2*p)}" y2="${p+n*(H-2*p)}"/>`).join("")}<path class="area" d="${area}"/><path class="line" d="${path}"/>${coords.map(c=>`<circle class="dot" cx="${c.x}" cy="${c.y}" r="5"><title>${dateFmt(c.date,{day:"numeric",month:"short"})}: ${fmt(c.value,1)}</title></circle>`).join("")}</svg>`;
}

function renderProgress() {
  if (!user().exercises.some(e=>e.id===progressExercise)) progressExercise=user().exercises[0]?.id;
  const points=chartSeries(user(),progressMetric,progressExercise);
  const report=reportData(user(),"month",new Date());
  let body=pageHead(t("progress"),lang()==="th"?"กราฟเส้น":"Line charts",`<button class="btn small-btn with-icon" data-action="report">${icon("report",17)}${t("report")}</button>`);
  body+=`<section class="grid-2"><div class="metric"><b>${fmt(report.totals.volume)}</b><span>${t("volume")} · ${t("kg")}</span></div><div class="metric"><b>${fmt(report.totals.calories)}</b><span>${t("calories")} · ${t("kcal")}</span></div></section>
  <section class="card section"><div class="segmented">${[["weight",t("topWeight")],["oneRM",t("estimated1RM")],["volume",t("volume")],["calories",t("calories")]].map(([k,v])=>`<button data-action="metric" data-metric="${k}" class="${progressMetric===k?"active":""}">${v}</button>`).join("")}</div>
  ${["weight","oneRM"].includes(progressMetric)?`<div class="field" style="margin-top:14px"><label>${t("chooseExercise")}</label><select data-action="progress-exercise">${user().exercises.map(e=>`<option value="${e.id}" ${e.id===progressExercise?"selected":""}>${escapeHTML(lang()==="th"?e.nameTh||e.name:e.name)}</option>`).join("")}</select></div>`:""}
  <div style="margin-top:12px">${lineChart(points)}</div>${points.length?`<div class="row small muted"><span>${dateFmt(points[0].date,{day:"numeric",month:"short"})}</span><span>${dateFmt(points.at(-1).date,{day:"numeric",month:"short"})}</span></div>`:""}</section>`;
  return shell(body);
}

function periodLabel(data) { return `${dateFmt(data.start,{day:"numeric",month:"short"})} – ${dateFmt(data.end,{day:"numeric",month:"short",year:"numeric"})}`; }

function renderReport() {
  const data=reportData(user(),reportPeriod,reportAnchor);
  return shell(`${pageHead(t("report"),periodLabel(data),`<button class="btn small-btn no-print with-icon" data-action="print">${icon("report",17)}${t("printPDF")}</button>`)}
  <div class="segmented no-print" style="margin-bottom:12px"><button data-action="report-period" data-period="week" class="${reportPeriod==="week"?"active":""}">${t("weekly")}</button><button data-action="report-period" data-period="month" class="${reportPeriod==="month"?"active":""}">${t("monthly")}</button></div>
  <div class="row no-print" style="margin-bottom:14px"><button class="icon-btn" data-action="report-shift" data-shift="-1">${icon("back")}</button><b>${periodLabel(data)}</b><button class="icon-btn" data-action="report-shift" data-shift="1">${icon("chevron")}</button></div>
  <article class="report-paper"><div class="row"><div><div class="eyebrow">LiftLog · ${t("report")}</div><h1>${escapeHTML(user().name)}</h1><p class="muted">${periodLabel(data)}</p></div><div class="mark">L</div></div><hr>
  <div class="grid-2"><div class="metric"><b>${data.sessions.length}</b><span>${t("sessions")}</span></div><div class="metric"><b>${fmt(data.totals.calories)}</b><span>${t("calories")} · ${t("kcal")}</span></div><div class="metric"><b>${fmt(data.totals.volume)}</b><span>${t("volume")} · ${t("kg")}</span></div><div class="metric"><b>${fmt(data.totals.duration)}</b><span>${t("duration")} · ${t("minutes")}</span></div></div>
  <section class="section"><h2>${t("summary")}</h2><div class="stack" style="margin-top:12px"><div><div class="row small"><span>${t("strength")}</span><b>${data.totals.strength}</b></div><div class="report-bar"><i style="width:${data.sessions.length?data.totals.strength/data.sessions.length*100:0}%"></i></div></div><div><div class="row small"><span>${t("cardio")}</span><b>${data.totals.cardio}</b></div><div class="report-bar"><i style="width:${data.sessions.length?data.totals.cardio/data.sessions.length*100:0}%"></i></div></div></div></section>
  <section class="section"><h2>${t("bestLifts")}</h2>${data.best.length?data.best.slice(0,6).map(x=>`<div class="row" style="padding:10px 0;border-bottom:1px solid #dfe8ea"><span>${escapeHTML(exerciseName(x.exerciseId))}</span><b>${fmt(x.weight,1)} ${t("kg")} × ${x.reps}</b></div>`).join(""):`<p class="muted">${t("noData")}</p>`}</section>
  <p class="small muted">${lang()==="th"?"สร้างจากข้อมูลที่บันทึกใน LiftLog บนอุปกรณ์นี้":"Generated from workout data stored in LiftLog on this device."}</p></article>`);
}

function renderSettings() {
  const colors={cool:"#1976a8",warm:"#c25b34",forest:"#34715a",mono:"#3c4650"};
  let body=pageHead(t("settings"),escapeHTML(user().name));
  body+=`<section class="card"><h2 class="title-icon">${icon("user")} ${t("profiles")}</h2>${state.users.map(u=>`<div class="settings-row"><div class="title-icon">${icon("user",18)}<b>${escapeHTML(u.name)}</b>${u.id===state.activeUserId?` <span class="badge good">${icon("check",13)}${t("active")}</span>`:""}</div><button class="btn secondary small-btn" data-action="switch-user" data-user="${u.id}" ${u.id===state.activeUserId?"disabled":""}>${lang()==="th"?"เลือก":"Select"}</button></div>`).join("")}<button class="btn ghost with-icon" style="width:100%;margin-top:12px" data-action="new-user">${icon("plus",18)}${t("addUser")}</button></section>
  <section class="card section"><h2 class="title-icon">${icon("settings")} ${lang()==="th"?"ตัวเลือก":"Preferences"}</h2><div class="settings-row"><span>${t("bodyWeight")}</span><div style="width:115px"><input data-setting="bodyWeight" type="number" min="20" step="0.1" value="${user().bodyWeight}"></div></div>
  <div class="settings-row"><span>${t("language")}</span><div class="segmented" style="width:170px"><button data-setting="language" data-value="th" class="${lang()==="th"?"active":""}">ไทย</button><button data-setting="language" data-value="en" class="${lang()==="en"?"active":""}">English</button></div></div>
  <div class="settings-row"><span>${t("appearance")}</span><div class="segmented" style="width:220px">${["system","light","dark"].map(k=>`<button data-setting="appearance" data-value="${k}" class="${state.settings.appearance===k?"active":""}">${t(k)}</button>`).join("")}</div></div>
  <div style="padding-top:13px"><div class="muted small" style="margin-bottom:9px">${t("color")}</div><div class="grid-2">${Object.entries(colors).map(([k,c])=>`<button class="btn ${state.settings.theme===k?"":"secondary"}" data-setting="theme" data-value="${k}" style="display:flex;align-items:center;justify-content:center;gap:8px"><i class="color-dot" style="background:${c}"></i>${t(k)}</button>`).join("")}</div></div></section>
  <section class="card section"><h2 class="title-icon">${icon("shield")} ${t("backup")}</h2><p class="muted small">${t("privacy")}</p><div class="grid-2"><button class="btn secondary with-icon" data-action="export">${icon("download",18)}${t("export")}</button><button class="btn secondary with-icon" data-action="import">${icon("upload",18)}${t("import")}</button></div><button class="btn ghost with-icon" style="width:100%;margin-top:10px" data-action="persist-storage" ${persistence?"disabled":""}>${icon("shield",18)}${persistence?t("storageOn"):t("storageOff")}</button><input id="import-file" class="hidden" type="file" accept="application/json"></section>
  <section class="card section"><h2 class="title-icon">${icon("download")} ${t("install")}</h2><p>${t("installHelp")}</p><div class="notice">${lang()==="th"?"หลังติดตั้ง เปิดได้จากหน้าจอโฮมและใช้ได้แม้ไม่มีอินเทอร์เน็ต":"After installation, open it from the Home Screen and use it offline."}</div></section>`;
  return shell(body);
}

function draw() {
  const pages={today:renderToday,plans:renderPlans,history:renderHistory,progress:renderProgress,report:renderReport,settings:renderSettings};
  root.innerHTML=(pages[route]||renderToday)();
}

function showModal(title, content) {
  modalRoot.innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-handle"></div><div class="modal-head"><h2>${title}</h2><button class="icon-btn" data-action="close-modal" aria-label="${t("cancel")}">${icon("close")}</button></div>${content}</section></div>`;
}
const closeModal=()=>modalRoot.replaceChildren();

function planEditor(dayIndex, todayOnly=false) {
  const now=new Date(); const plan=todayOnly?activePlan(user()):(user().programs.find(p=>p.id===selectedPlanId)||activePlan(user()));
  const day=todayOnly?resolveDay(user(),now).day:structuredClone(plan.days[dayIndex]||restDay());
  showModal(t("editDay"),`<form class="stack" data-form="day-editor" data-day="${dayIndex}" data-today="${todayOnly}" data-plan="${plan.id}"><div class="segmented">${["strength","cardio","rest"].map(k=>`<button type="button" data-action="day-mode" data-mode="${k}" class="${day.mode===k?"active":""}">${t(k)}</button>`).join("")}</div><input type="hidden" name="mode" value="${day.mode}"><div data-editor-body>${dayEditorBody(day)}</div><div class="grid-2"><button type="button" class="btn secondary" data-action="close-modal">${t("cancel")}</button><button class="btn">${t("save")}</button></div></form>`);
}

function dayEditorBody(day) {
  if(day.mode==="rest") return `<div class="empty"><div class="empty-icon">${icon("rest",34)}</div>${t("rest")}</div>`;
  if(day.mode==="cardio") return `<div class="field"><label>${t("activity")}</label><select name="activity">${Object.entries(CARDIO).map(([k,v])=>`<option value="${k}" ${day.cardio?.activity===k?"selected":""}>${lang()==="th"?v.th:v.en}</option>`).join("")}</select></div><div class="field"><label>${t("duration")} (${t("minutes")})</label><input name="minutes" type="number" min="1" value="${day.cardio?.minutes||30}"></div><label class="row" style="justify-content:flex-start"><input name="treadmill" type="checkbox" style="width:20px;min-height:20px" ${day.cardio?.treadmill?"checked":""}>${t("treadmill")}</label><div class="grid-2"><div class="field"><label>${t("speed")}</label><input name="speed" type="number" step="0.1" value="${day.cardio?.speed||5}"></div><div class="field"><label>${t("incline")}</label><input name="incline" type="number" step="0.5" value="${day.cardio?.incline||0}"></div></div>`;
  const list=day.exercises||[];
  return `<div class="stack" data-exercise-list>${list.map((x,i)=>exerciseEditorRow(x,i)).join("")}</div><button type="button" class="btn ghost with-icon" data-action="add-editor-exercise">${icon("plus",18)}${t("addExercise")}</button>`;
}

function exerciseEditorRow(x,index) {
  return `<div class="card" style="box-shadow:none;padding:12px" data-edit-exercise><div class="row"><div class="field" style="flex:1"><label>${t("chooseExercise")}</label><select name="exerciseId">${user().exercises.map(e=>`<option value="${e.id}" ${e.id===x.exerciseId?"selected":""}>${escapeHTML(lang()==="th"?e.nameTh||e.name:e.name)}</option>`).join("")}</select></div><button type="button" class="icon-btn danger-icon" data-action="remove-editor-exercise" aria-label="${t("delete")}">${icon("trash",17)}</button></div><div class="grid-2"><div class="field"><label>${t("weight")} (${t("kg")})</label><input name="weight" type="number" min="0" step="0.5" value="${x.weight||0}"></div><div class="field"><label>${t("reps")} (${lang()==="th"?"คั่นด้วย /":"separate with /"})</label><input name="reps" value="${(x.repsBySet||[12,10,8]).join("/")}"></div></div></div>`;
}

function profilesModal() {
  showModal(t("profiles"),`<div class="stack">${state.users.map(u=>`<button class="btn ${u.id===state.activeUserId?"":"secondary"} with-icon" data-action="switch-user" data-user="${u.id}">${icon("user",18)}${escapeHTML(u.name)} ${u.id===state.activeUserId?icon("check",16):""}</button>`).join("")}<button class="btn ghost with-icon" data-action="new-user">${icon("plus",18)}${t("addUser")}</button></div>`);
}

function startSession() {
  const {plan,day}=resolveDay(user());
  user().activeSession={id:uid("session"),kind:day.mode,startedAt:new Date().toISOString(),intensity:user().defaultIntensity||"moderate",bodyWeight:user().bodyWeight,planName:plan?.name||"",planned:structuredClone(day.exercises||[]),sets:[],feedback:{},...(day.cardio||{})};
  persist(true); toast(t("sessionStarted"));
}

function finishSession() {
  const session=user().activeSession; if(!session)return;
  const cardioForm=document.querySelector('[data-form="cardio"]');
  if(session.kind==="cardio"&&cardioForm){const data=new FormData(cardioForm);Object.assign(session,{activity:data.get("activity"),minutes:Number(data.get("minutes")),distance:Number(data.get("distance")),treadmill:data.get("treadmill")==="on",speed:Number(data.get("speed")),incline:Number(data.get("incline")),note:data.get("note")});}
  session.endedAt=new Date().toISOString(); user().sessions.push(session); user().activeSession=null;
  persist(true); toast(t("sessionFinished"));
}

document.addEventListener("click",async event=>{
  if(event.target.classList?.contains("modal-backdrop")){closeModal();return;}
  const routeButton=event.target.closest("[data-route]"); if(routeButton){route=routeButton.dataset.route; draw(); scrollTo(0,0); return;}
  const el=event.target.closest("[data-action],[data-setting]"); if(!el)return;
  const action=el.dataset.action;
  if(action==="close-modal"){closeModal();return;}
  if(action==="profiles"){profilesModal();return;}
  if(action==="start-session"){startSession();return;}
  if(action==="finish-session"){finishSession();return;}
  if(action==="edit-day"){showModal(t("editDay"),`<div class="stack"><p class="muted">${lang()==="th"?"ต้องการให้การเปลี่ยนแปลงมีผลนานแค่ไหน?":"How long should this change apply?"}</p><button class="btn" data-action="edit-day-scope" data-scope="today">${t("todayOnly")}</button><button class="btn secondary" data-action="edit-day-scope" data-scope="permanent">${t("permanent")}</button></div>`);return;}
  if(action==="edit-day-scope"){planEditor(new Date().getDay(),el.dataset.scope==="today");return;}
  if(action==="edit-plan-day"){planEditor(Number(el.dataset.day),false);return;}
  if(action==="day-mode"){
    const form=el.closest("form"); form.querySelector('input[name="mode"]').value=el.dataset.mode; form.querySelectorAll(".segmented button").forEach(b=>b.classList.toggle("active",b===el));
    form.querySelector("[data-editor-body]").innerHTML=dayEditorBody(el.dataset.mode==="strength"?{mode:"strength",exercises:[]} : el.dataset.mode==="cardio"?{mode:"cardio",cardio:{activity:"walking",minutes:30,treadmill:true,speed:5,incline:0}}:restDay()); return;
  }
  if(action==="add-editor-exercise"){el.previousElementSibling.insertAdjacentHTML("beforeend",exerciseEditorRow({exerciseId:user().exercises[0].id,weight:0,repsBySet:[12,10,8]},99));return;}
  if(action==="remove-editor-exercise"){el.closest("[data-edit-exercise]").remove();return;}
  if(action==="delete-set") { user().activeSession.sets=user().activeSession.sets.filter(s=>s.id!==el.dataset.set); await persist(true); return; }
  if(action==="feedback") { user().activeSession.feedback[el.dataset.exercise]=el.dataset.value; await persist(true); return; }
  if(action==="new-plan") { showModal(t("newPlan"),`<form class="stack" data-form="new-plan"><div class="field"><label>${t("choosePreset")}</label><select name="preset"><option value="lean">${t("lean")}</option><option value="build">${t("build")}</option><option value="custom">${t("custom")}</option></select></div><div class="field"><label>${t("planName")}</label><input name="name" required placeholder="My Plan"></div><button class="btn">${t("save")}</button></form>`); return; }
  if(action==="select-plan") { selectedPlanId=el.dataset.plan; draw(); return; }
  if(action==="activate-plan") { user().activeProgramId=selectedPlanId || activePlan(user()).id; selectedPlanId=null; await persist(true); return; }
  if(action==="rename-plan") { const p=user().programs.find(x=>x.id===selectedPlanId)||activePlan(user()); showModal(t("planName"),`<form class="stack" data-form="rename-plan" data-plan="${p.id}"><div class="field"><input name="name" value="${escapeHTML(p.name)}" required></div><button class="btn">${t("save")}</button></form>`); return; }
  if(action==="delete-plan") { const p=user().programs.find(x=>x.id===selectedPlanId)||activePlan(user()); if(user().programs.length<=1){toast(t("cannotDelete"));return;} showModal(t("confirmDelete"),`<p>${lang()==="th"?`ลบแผน “${escapeHTML(p.name)}” หรือไม่? ประวัติการฝึกจะยังอยู่`:`Delete “${escapeHTML(p.name)}”? Workout history will remain.`}</p><div class="grid-2"><button class="btn secondary" data-action="close-modal">${t("cancel")}</button><button class="btn danger" data-action="confirm-delete-plan" data-plan="${p.id}">${t("delete")}</button></div>`); return; }
  if(action==="confirm-delete-plan") { deletePlan(user(),el.dataset.plan); selectedPlanId=null; closeModal(); await persist(true); return; }
  if(action==="delete-session") { user().sessions=user().sessions.filter(s=>s.id!==el.dataset.session); await persist(true); return; }
  if(action==="metric") { progressMetric=el.dataset.metric; draw(); return; }
  if(action==="report") { route="report"; draw(); return; }
  if(action==="report-period") { reportPeriod=el.dataset.period; draw(); return; }
  if(action==="report-shift") { const amount=Number(el.dataset.shift); if(reportPeriod==="week")reportAnchor.setDate(reportAnchor.getDate()+amount*7);else reportAnchor.setMonth(reportAnchor.getMonth()+amount);draw();return; }
  if(action==="print") { window.print(); return; }
  if(action==="switch-user") { state.activeUserId=el.dataset.user; selectedPlanId=null; closeModal(); await persist(true); return; }
  if(action==="new-user") { showModal(t("addUser"),`<form class="stack" data-form="new-user"><div class="field"><label>${t("userName")}</label><input name="name" required autofocus></div><div class="field"><label>${t("bodyWeight")} (${t("kg")})</label><input name="bodyWeight" type="number" min="20" value="70"></div><button class="btn">${t("save")}</button></form>`); return; }
  if(action==="export") { const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`LiftLog-backup-${localDateKey()}.json`;a.click();URL.revokeObjectURL(a.href);toast(t("exported"));return; }
  if(action==="import") { document.querySelector("#import-file").click();return; }
  if(action==="persist-storage") { persistence=await requestPersistentStorage();draw();toast(persistence?t("storageOn"):t("storageOff"));return; }
  if(el.dataset.setting) {
    const key=el.dataset.setting;
    if(key==="bodyWeight")return;
    state.settings[key]=el.dataset.value; await persist(true); return;
  }
});

document.addEventListener("change",async event=>{
  if(event.target.matches('[data-action="progress-exercise"]')){progressExercise=event.target.value;draw();return;}
  if(event.target.matches('[data-setting="bodyWeight"]')){user().bodyWeight=Number(event.target.value)||70;await persist();return;}
  if(event.target.id==="import-file"&&event.target.files[0]){
    try{state=normalizeState(JSON.parse(await event.target.files[0].text()));await persist(true);toast(t("imported"));}catch{toast(lang()==="th"?"ไฟล์สำรองไม่ถูกต้อง":"Invalid backup file");}
  }
});

document.addEventListener("submit",async event=>{
  event.preventDefault(); const form=event.target; const data=new FormData(form); const kind=form.dataset.form;
  if(kind==="set"){
    if(!user().activeSession)return; const warm=document.querySelector(`[data-warmup="${form.dataset.exercise}"]`);
    user().activeSession.sets.push({id:uid("set"),exerciseId:form.dataset.exercise,weight:Number(data.get("weight")),reps:Number(data.get("reps")),warmup:Boolean(warm?.checked),createdAt:new Date().toISOString()}); if(warm)warm.checked=false; await persist(true); return;
  }
  if(kind==="cardio") { if(!user().activeSession)return; Object.assign(user().activeSession,{activity:data.get("activity"),minutes:Number(data.get("minutes")),distance:Number(data.get("distance")),treadmill:data.get("treadmill")==="on",speed:Number(data.get("speed")),incline:Number(data.get("incline")),note:data.get("note")});await persist(true);toast(t("copied"));return; }
  if(kind==="day-editor") {
    const mode=data.get("mode"); let day;
    if(mode==="rest")day=restDay(); else if(mode==="cardio")day={mode,cardio:{activity:data.get("activity"),minutes:Number(data.get("minutes"))||30,distance:0,treadmill:data.get("treadmill")==="on",speed:Number(data.get("speed"))||5,incline:Number(data.get("incline"))||0}};
    else day={mode,exercises:[...form.querySelectorAll("[data-edit-exercise]")].map(row=>{const reps=row.querySelector('[name="reps"]').value.split(/[\/,\s]+/).map(Number).filter(n=>n>0);return{exerciseId:row.querySelector('[name="exerciseId"]').value,weight:Number(row.querySelector('[name="weight"]').value)||0,sets:reps.length,repsBySet:reps.length?reps:[12,10,8]};})};
    if(form.dataset.today==="true") user().overrides[localDateKey()]={sourceProgramId:activePlan(user()).id,sourceProgramName:activePlan(user()).name,dayPlan:day}; else (user().programs.find(p=>p.id===form.dataset.plan)||activePlan(user())).days[Number(form.dataset.day)]=day;
    closeModal();await persist(true);return;
  }
  if(kind==="new-plan") { const key=data.get("preset"); const plan=key==="custom"?{...presetPlan("lean",data.get("name")),presetKey:"custom",days:{0:restDay(),1:restDay(),2:restDay(),3:restDay(),4:restDay(),5:restDay(),6:restDay()}}:presetPlan(key,data.get("name")||undefined);user().programs.push(plan);user().activeProgramId=plan.id;closeModal();await persist(true);return; }
  if(kind==="rename-plan") { (user().programs.find(p=>p.id===form.dataset.plan)||activePlan(user())).name=data.get("name");closeModal();await persist(true);return; }
  if(kind==="new-user") { const lean=presetPlan("lean");const u={id:uid("user"),name:data.get("name"),bodyWeight:Number(data.get("bodyWeight"))||70,defaultIntensity:"moderate",exercises:structuredClone(state.users[0].exercises),programs:[lean,presetPlan("build")],activeProgramId:lean.id,overrides:{},sessions:[],activeSession:null};state.users.push(u);state.activeUserId=u.id;closeModal();await persist(true);return; }
});

async function boot() {
  try { state=normalizeState(await loadState() || createInitialState()); }
  catch { state=createInitialState(); }
  persistence=await isStoragePersistent(); applyTheme(); draw(); await saveState(state);
  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{if(state.settings.appearance==="system"){applyTheme();draw();}});
}
boot();
