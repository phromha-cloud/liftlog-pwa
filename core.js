export const APP_VERSION = 2;

export const EXERCISES = [
  ["bench-press", "Bench Press", "เบนช์เพรส", "chest"],
  ["incline-db-press", "Incline Dumbbell Press", "ดัมเบลเพรสเอียง", "chest"],
  ["chest-fly", "Chest Fly", "เชสต์ฟลาย", "chest"],
  ["push-up", "Push-up", "วิดพื้น", "chest"],
  ["deadlift", "Deadlift", "เดดลิฟต์", "back"],
  ["barbell-row", "Barbell Row", "บาร์เบลโรว์", "back"],
  ["lat-pulldown", "Lat Pulldown", "แลตพูลดาวน์", "back"],
  ["pull-up", "Pull-up", "ดึงข้อ", "back"],
  ["back-squat", "Back Squat", "สควอทหลัง", "legs"],
  ["front-squat", "Front Squat", "สควอทหน้า", "legs"],
  ["leg-press", "Leg Press", "เลกเพรส", "legs"],
  ["romanian-deadlift", "Romanian Deadlift", "โรมาเนียนเดดลิฟต์", "legs"],
  ["leg-curl", "Leg Curl", "เลกเคิร์ล", "legs"],
  ["leg-extension", "Leg Extension", "เลกเอ็กซ์เทนชัน", "legs"],
  ["calf-raise", "Calf Raise", "เขย่งน่อง", "legs"],
  ["overhead-press", "Overhead Press", "โอเวอร์เฮดเพรส", "shoulders"],
  ["lateral-raise", "Lateral Raise", "กางข้างไหล่", "shoulders"],
  ["face-pull", "Face Pull", "เฟซพูล", "shoulders"],
  ["barbell-curl", "Barbell Curl", "บาร์เบลเคิร์ล", "arms"],
  ["dumbbell-curl", "Dumbbell Curl", "ดัมเบลเคิร์ล", "arms"],
  ["triceps-pushdown", "Triceps Pushdown", "ไตรเซปพุชดาวน์", "arms"],
  ["skull-crusher", "Skull Crusher", "สกัลครัชเชอร์", "arms"],
  ["plank", "Plank", "แพลงก์", "core"],
  ["hanging-leg-raise", "Hanging Leg Raise", "ยกขาห้อยตัว", "core"],
  ["cable-crunch", "Cable Crunch", "เคเบิลครันช์", "core"],
].map(([id, name, nameTh, category]) => ({ id, name, nameTh, category, custom: false }));

export const CARDIO = {
  walking: { en: "Walking", th: "เดิน", met: 3.8 },
  jogging: { en: "Jogging", th: "วิ่ง", met: 7.5 },
  cycling: { en: "Cycling", th: "ปั่นจักรยาน", met: 6.8 },
  elliptical: { en: "Elliptical", th: "เครื่องเดินวงรี", met: 5.0 },
  rowing: { en: "Rowing", th: "เครื่องกรรเชียง", met: 5.0 },
};

export const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateFromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function startOfWeek(date = new Date()) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

export function endOfWeek(date = new Date()) {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  return end;
}

export function rangeForPeriod(period, anchor = new Date()) {
  if (period === "week") return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
  return {
    start: new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12),
    end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12),
  };
}

export function calculateOneRM(weight, reps) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  return r > 0 ? w * (1 + r / 30) : 0;
}

export function treadmillMET(speedKmh, inclinePercent) {
  const metersPerMinute = (Number(speedKmh) || 0) * 1000 / 60;
  const oxygen = 3.5 + 0.1 * metersPerMinute + 1.8 * metersPerMinute * ((Number(inclinePercent) || 0) / 100);
  return Math.max(1, oxygen / 3.5);
}

export function caloriesForMET(met, bodyWeight, minutes) {
  return Math.max(0, (Number(met) || 0) * 3.5 * (Number(bodyWeight) || 0) / 200 * (Number(minutes) || 0));
}

export function sessionStats(session) {
  if (session.kind === "cardio") {
    const met = session.activity === "walking" && session.treadmill
      ? treadmillMET(session.speed, session.incline)
      : Number(session.met || CARDIO[session.activity]?.met || 3.8);
    return {
      volume: 0,
      duration: Number(session.minutes) || 0,
      calories: caloriesForMET(met, session.bodyWeight, session.minutes),
      sets: 0,
    };
  }
  const sets = session.sets || [];
  const volume = sets.filter(s => !s.warmup).reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
  const measured = session.endedAt && session.startedAt ? (new Date(session.endedAt) - new Date(session.startedAt)) / 60000 : 0;
  const duration = Math.max(measured, sets.length * 2.5);
  const strengthMET = { light: 3.5, moderate: 5, vigorous: 6 }[session.intensity] || 5;
  return { volume, duration, calories: caloriesForMET(strengthMET, session.bodyWeight, duration), sets: sets.length };
}

function strengthDay(items) {
  return { mode: "strength", exercises: items.map(([exerciseId, sets, weight, reps]) => ({ exerciseId, sets, weight, repsBySet: Array(sets).fill(reps) })) };
}

function cardioDay(activity = "walking", minutes = 30) {
  return { mode: "cardio", cardio: { activity, minutes, distance: 0, treadmill: activity === "walking", speed: 5, incline: 0 } };
}

export const restDay = () => ({ mode: "rest" });

export function presetPlan(key, nameOverride) {
  if (key === "build") {
    return {
      id: uid("plan"), name: nameOverride || "Build Plan", presetKey: "build", createdAt: new Date().toISOString(),
      days: {
        1: strengthDay([["bench-press", 4, 40, 8], ["barbell-row", 4, 40, 8], ["overhead-press", 3, 25, 10]]),
        2: strengthDay([["back-squat", 4, 50, 8], ["romanian-deadlift", 3, 45, 10], ["calf-raise", 3, 30, 12]]),
        3: restDay(),
        4: strengthDay([["incline-db-press", 4, 15, 10], ["lat-pulldown", 4, 35, 10], ["barbell-curl", 3, 15, 12], ["triceps-pushdown", 3, 20, 12]]),
        5: strengthDay([["deadlift", 3, 60, 6], ["leg-press", 4, 70, 10], ["leg-curl", 3, 25, 12]]),
        6: cardioDay("walking", 30), 0: restDay(),
      },
    };
  }
  return {
    id: uid("plan"), name: nameOverride || "Lean Plan", presetKey: "lean", createdAt: new Date().toISOString(),
    days: {
      1: strengthDay([["back-squat", 3, 35, 12], ["push-up", 3, 0, 12], ["barbell-row", 3, 25, 12]]),
      2: cardioDay("walking", 35),
      3: strengthDay([["romanian-deadlift", 3, 35, 12], ["overhead-press", 3, 15, 10], ["lat-pulldown", 3, 25, 12]]),
      4: restDay(),
      5: strengthDay([["leg-press", 3, 50, 12], ["incline-db-press", 3, 10, 12], ["face-pull", 3, 15, 15]]),
      6: cardioDay("jogging", 25), 0: restDay(),
    },
  };
}

export function createInitialState() {
  const lean = presetPlan("lean");
  const build = presetPlan("build");
  const firstUser = {
    id: uid("user"), name: "phrom", bodyWeight: 70, defaultIntensity: "moderate",
    exercises: structuredClone(EXERCISES), programs: [lean, build], activeProgramId: lean.id,
    overrides: {}, sessions: [], activeSession: null,
  };
  return {
    version: APP_VERSION,
    settings: { language: "th", appearance: "system", theme: "cool" },
    activeUserId: firstUser.id,
    users: [firstUser],
  };
}

export function normalizeState(input) {
  if (!input || typeof input !== "object" || !Array.isArray(input.users) || !input.users.length || (input.version ?? 1) > APP_VERSION) throw new Error("invalid-backup");
  const value = structuredClone(input);
  const ids = new Set();
  const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
  const validNumber = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  const checkDay = day => {
    if (!day || !['strength','cardio','rest'].includes(day.mode)) throw new Error('invalid-backup');
    if (day.mode === 'strength' && (!Array.isArray(day.exercises) || day.exercises.some(x => !x || !validId(x.exerciseId) || !validNumber(x.weight) || !Number.isInteger(x.sets) || x.sets < 0 || !Array.isArray(x.repsBySet) || !x.repsBySet.length || x.repsBySet.some(n => !Number.isInteger(n) || n < 1)))) throw new Error('invalid-backup');
    if (day.mode === 'cardio' && (!day.cardio || !CARDIO[day.cardio.activity] || !validNumber(day.cardio.minutes))) throw new Error('invalid-backup');
  };
  value.version = APP_VERSION;
  value.settings = { language: "th", appearance: "system", theme: "cool", ...value.settings };
  if (!['th', 'en'].includes(value.settings.language)) value.settings.language = 'th';
  for (const user of value.users) {
    if (!user || !validId(user.id) || ids.has(user.id) || typeof user.name !== 'string' || !Array.isArray(user.programs) || !user.programs.length || !Array.isArray(user.sessions)) throw new Error('invalid-backup');
    ids.add(user.id);
    for (const p of user.programs) {
      if (!p || !validId(p.id) || typeof p.name !== 'string' || !p.days || typeof p.days !== 'object') throw new Error('invalid-backup');
      Object.values(p.days).forEach(checkDay);
    }
    for (const session of [...user.sessions, ...(user.activeSession ? [user.activeSession] : [])]) {
      if (!session || !validId(session.id) || !['strength', 'cardio'].includes(session.kind) || !Number.isFinite(Date.parse(session.startedAt)) || (session.kind === 'strength' && !Array.isArray(session.sets))) throw new Error('invalid-backup');
      if (session.sets?.some(x => !x || !validId(x.exerciseId) || (x.id !== undefined && !validId(x.id)) || !validNumber(x.weight) || !Number.isInteger(x.reps) || x.reps < 1 || (x.barWeight != null && !validNumber(x.barWeight)))) throw new Error('invalid-backup');
      if (session.planned) checkDay({mode:'strength',exercises:session.planned});
    }
    user.exercises ||= structuredClone(EXERCISES);
    if (!Array.isArray(user.exercises) || user.exercises.some(e => !e || !validId(e.id) || typeof e.name !== 'string')) throw new Error('invalid-backup');
    user.overrides ||= {};
    for (const override of Object.values(user.overrides)) checkDay(override?.dayPlan);
    user.bodyWeight ||= 70;
    user.restAutomatic ??= true;
    user.restDuration = [0, 60, 90].includes(user.restDuration) ? user.restDuration : 0;
    if (user.restTimer && (!Number.isFinite(user.restTimer.deadline) || user.restTimer.sessionId !== user.activeSession?.id)) user.restTimer = null;
  }
  if (!value.users.some(u => u.id === value.activeUserId)) value.activeUserId = value.users[0]?.id;
  return value;
}

export const activeUser = state => state.users.find(u => u.id === state.activeUserId) || state.users[0];
export const activePlan = user => user.programs.find(p => p.id === user.activeProgramId) || user.programs[0];

export function resolveDay(user, date = new Date()) {
  const key = localDateKey(date);
  const plan = activePlan(user);
  const override = user.overrides?.[key];
  return { plan, day: structuredClone(override?.dayPlan || plan?.days?.[date.getDay()] || restDay()), overridden: Boolean(override) };
}

export function deletePlan(user, planId) {
  if (user.programs.length <= 1) return false;
  const wasActive = user.activeProgramId === planId;
  user.programs = user.programs.filter(p => p.id !== planId);
  if (wasActive) user.activeProgramId = user.programs[0].id;
  return true;
}

export function nextSetDefaults(session, plannedExercise) {
  const done = (session?.sets || []).filter(s => s.exerciseId === plannedExercise.exerciseId && !s.warmup);
  const weight = done.length ? done.at(-1).weight : plannedExercise.weight;
  const repsIndex = Math.min(done.length, Math.max(0, plannedExercise.repsBySet.length - 1));
  return { weight: Number(weight) || 0, reps: Number(plannedExercise.repsBySet[repsIndex]) || 0, setNumber: done.length + 1 };
}

export function previousWeekExercise(user, exerciseId, date = new Date()) {
  const target = new Date(date);
  target.setDate(target.getDate() - 7);
  const key = localDateKey(target);
  const sessions = user.sessions.filter(s => s.kind === "strength" && localDateKey(new Date(s.startedAt)) === key);
  const sets = sessions.flatMap(s => s.sets || []).filter(s => s.exerciseId === exerciseId && !s.warmup);
  if (!sets.length) return null;
  return { weight: Math.max(...sets.map(s => Number(s.weight) || 0)), reps: sets.map(s => Number(s.reps) || 0).join(" / ") };
}

export function sessionsInRange(user, start, end) {
  const from = new Date(start); from.setHours(0, 0, 0, 0);
  const to = new Date(end); to.setHours(23, 59, 59, 999);
  return user.sessions.filter(s => { const d = new Date(s.startedAt); return d >= from && d <= to; });
}

export function reportData(user, period, anchor = new Date()) {
  const range = rangeForPeriod(period, anchor);
  const sessions = sessionsInRange(user, range.start, range.end);
  const totals = sessions.reduce((sum, session) => {
    const stats = sessionStats(session);
    sum.calories += stats.calories; sum.volume += stats.volume; sum.duration += stats.duration; sum.sets += stats.sets;
    if (session.kind === "strength") sum.strength += 1; else sum.cardio += 1;
    return sum;
  }, { calories: 0, volume: 0, duration: 0, sets: 0, strength: 0, cardio: 0 });
  const best = new Map();
  for (const session of sessions.filter(s => s.kind === "strength")) for (const set of session.sets || []) {
    if (set.warmup) continue;
    const oneRM = calculateOneRM(set.weight, set.reps);
    if (!best.has(set.exerciseId) || best.get(set.exerciseId).oneRM < oneRM) best.set(set.exerciseId, { ...set, oneRM });
  }
  return { ...range, sessions, totals, best: [...best.entries()].map(([exerciseId, value]) => ({ exerciseId, ...value })).sort((a, b) => b.oneRM - a.oneRM) };
}

export function chartSeries(user, metric, exerciseId, days = 90) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  const result = [];
  for (const session of [...user.sessions].sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt))) {
    if (new Date(session.startedAt) < cutoff) continue;
    if (metric === "weight" || metric === "oneRM") {
      const sets = (session.sets || []).filter(s => s.exerciseId === exerciseId && !s.warmup);
      if (!sets.length) continue;
      result.push({ date: new Date(session.startedAt), value: Math.max(...sets.map(s => metric === "weight" ? Number(s.weight) : calculateOneRM(s.weight, s.reps))) });
    } else {
      const stats = sessionStats(session);
      const value = metric === "volume" ? stats.volume : metric === "calories" ? stats.calories : session.kind === "cardio" ? stats.duration : 0;
      if (value) result.push({ date: new Date(session.startedAt), value });
    }
  }
  return result;
}

export function escapeHTML(text = "") {
  return String(text).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}
