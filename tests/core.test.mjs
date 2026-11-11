import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  createInitialState, activeUser, activePlan, resolveDay, nextSetDefaults,
  deletePlan, treadmillMET, caloriesForMET, calculateOneRM, reportData,
  normalizeState, localDateKey,
} from "../core.js";

test("initial data includes one profile and both presets", () => {
  const state = createInitialState();
  assert.equal(activeUser(state).name, "phrom");
  assert.deepEqual(activeUser(state).programs.map(p => p.presetKey), ["lean", "build"]);
});

test("today override wins without changing the recurring plan", () => {
  const state = createInitialState(); const u = activeUser(state);
  const monday = new Date(2026, 8, 7, 12); const recurring = structuredClone(activePlan(u).days[1]);
  u.overrides[localDateKey(monday)] = { dayPlan: { mode: "rest" } };
  assert.equal(resolveDay(u, monday).day.mode, "rest");
  assert.deepEqual(activePlan(u).days[1], recurring);
});

test("next set keeps latest weight and uses flexible rep target", () => {
  const item = { exerciseId:"bench-press", weight:40, sets:3, repsBySet:[12,10,8] };
  const session = { sets:[{exerciseId:"bench-press",weight:42.5,reps:12,warmup:false}] };
  assert.deepEqual(nextSetDefaults(session,item), { weight:42.5, reps:10, setNumber:2 });
});

test("deleting an active plan selects a replacement and keeps history", () => {
  const state=createInitialState(); const u=activeUser(state); const removed=u.activeProgramId;
  u.sessions.push({id:"old",kind:"strength",startedAt:new Date().toISOString(),sets:[]});
  assert.equal(deletePlan(u,removed),true);
  assert.notEqual(u.activeProgramId,removed);
  assert.equal(u.sessions.length,1);
  assert.equal(deletePlan(u,u.activeProgramId),false);
});

test("exercise and treadmill calculations match expected formulas", () => {
  assert.equal(calculateOneRM(100,10).toFixed(1), "133.3");
  assert.ok(treadmillMET(5,5) > treadmillMET(5,0));
  assert.equal(caloriesForMET(5,70,30).toFixed(1), "183.8");
});

test("weekly report includes only sessions inside Monday-Sunday", () => {
  const state=createInitialState(); const u=activeUser(state);
  u.sessions=[
    {id:"in",kind:"strength",startedAt:"2026-09-07T12:00:00",endedAt:"2026-09-07T12:30:00",bodyWeight:70,sets:[{exerciseId:"bench-press",weight:40,reps:10}]},
    {id:"out",kind:"strength",startedAt:"2026-09-14T12:00:00",endedAt:"2026-09-14T12:30:00",bodyWeight:70,sets:[]},
  ];
  const report=reportData(u,"week",new Date(2026,8,9,12));
  assert.deepEqual(report.sessions.map(s=>s.id),["in"]);
  assert.equal(report.totals.volume,400);
});

test("backup normalization rejects invalid data and restores a valid state", () => {
  assert.throws(()=>normalizeState({hello:"world"}),/invalid-backup/);
  const restored=normalizeState(structuredClone(createInitialState()));
  assert.equal(restored.users.length,1);
});

test("manifest and service worker include all offline assets", () => {
  const base=path.resolve(import.meta.dirname,"..");
  const manifest=JSON.parse(fs.readFileSync(path.join(base,"manifest.webmanifest"),"utf8"));
  assert.equal(manifest.display,"standalone");
  const worker=fs.readFileSync(path.join(base,"sw.js"),"utf8");
  for(const file of ["index.html","styles.css","app.js","core.js","db.js","icons.js","training.js","icon-192.png","icon-512.png"]){
    assert.ok(fs.existsSync(path.join(base,file)),file);
    assert.ok(worker.includes(file),`offline cache: ${file}`);
  }
});
