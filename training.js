import { localDateKey } from './core.js';

// Storage and charts always use total kilograms, including both sides and the bar.
export function isBarbell(exercise) {
  if (exercise?.weightEntry === 'total') return false;
  if (exercise?.weightEntry === 'plates') return true;
  const name = (exercise?.name || '').trim().toLowerCase();
  return /barbell|บาร์เบล/.test(name) || ['bench press', 'incline bench press', 'decline bench press', 'deadlift', 'back squat', 'front squat', 'romanian deadlift', 'overhead press'].includes(name);
}

export function barWeight(exercise) {
  return Number.isFinite(exercise?.barWeight) ? exercise.barWeight : 20;
}

export function platesFor(total, bar) {
  return Number.isFinite(total) && Number.isFinite(bar) && bar >= 0 && total >= bar ? (total - bar) / 2 : null;
}

export function totalFor(input, bar = null) {
  const total = bar === null ? input : input * 2 + bar;
  if (!Number.isFinite(input) || input < 0 || total > 1000 || (bar !== null && (!Number.isFinite(bar) || bar < 0 || bar > 50))) throw new Error('invalid-weight');
  return total;
}

export function entryDefaults(exercise, total) {
  const bar = barWeight(exercise);
  // Preserve legacy targets lighter than the selected bar instead of increasing them.
  const plates = isBarbell(exercise) ? platesFor(total, bar) : null;
  return { input: plates ?? total, bar: plates === null ? null : bar };
}

export function workoutProgress(session) {
  const targets = new Map(), counts = new Map();
  for (const item of session?.planned || []) targets.set(item.exerciseId, (targets.get(item.exerciseId) || 0) + Math.max(0, item.sets));
  const working = (session?.sets || []).filter(s => !s.warmup);
  for (const set of working) counts.set(set.exerciseId, (counts.get(set.exerciseId) || 0) + 1);
  let completed = 0, target = 0, exercises = 0;
  for (const [id, n] of targets) {
    target += n;
    completed += Math.min(counts.get(id) || 0, n);
    if (n > 0 && (counts.get(id) || 0) >= n) exercises++;
  }
  return { completed, target, exercises, exerciseTarget: [...targets.values()].filter(n => n > 0).length, additional: working.length - completed };
}

export function restSeconds(user, intensity) {
  return [60, 90].includes(user.restDuration) ? user.restDuration : intensity === 'vigorous' ? 90 : 60;
}

export function startRest(user, set, now = Date.now()) {
  const session = user.activeSession;
  if (user.restAutomatic === false || set.warmup || !session || session.kind !== 'strength' || session.endedAt || localDateKey(new Date(session.startedAt)) !== localDateKey(new Date(now))) return;
  user.restTimer = { sessionId: session.id, exerciseId: set.exerciseId, deadline: now + restSeconds(user, session.intensity) * 1000 };
}

export function remainingRest(timer, now = Date.now()) {
  return timer && Number.isFinite(timer.deadline) ? Math.min(600, Math.max(0, Math.ceil((timer.deadline - now) / 1000))) : 0;
}

export function extendRest(user, now = Date.now()) {
  if (user.restTimer) user.restTimer.deadline = Math.min(Math.max(now, user.restTimer.deadline) + 30000, now + 600000);
}
