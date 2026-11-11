import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState, normalizeState, activeUser, nextSetDefaults, sessionStats} from '../core.js';
import {entryDefaults, totalFor, platesFor, workoutProgress, restSeconds, startRest, remainingRest, extendRest} from '../training.js';
test('legacy migration preserves users, plans, history and original totals',()=>{
 const old=createInitialState();old.version=1;const u=activeUser(old);
 u.sessions=[{id:'old',kind:'strength',startedAt:'2026-09-01T10:00:00Z',sets:[{exerciseId:'bench-press',weight:45,reps:10}]}];
 const second=structuredClone(u);second.id='second';second.name='Second';old.users.push(second);old.activeUserId=second.id;
 const untouched=structuredClone(old),migrated=normalizeState(old);
 assert.deepEqual(old,untouched);assert.deepEqual(migrated.users[0].sessions,u.sessions);assert.deepEqual(migrated.users[1].programs,second.programs);assert.equal(migrated.activeUserId,'second');
 assert.equal(migrated.users[0].sessions[0].sets[0].barWeight,undefined);assert.equal(migrated.users[1].restAutomatic,true);
});
test('invalid or future backups cannot replace existing profiles',()=>{
 assert.throws(()=>normalizeState({version:2,users:[]}));
 const s=createInitialState();s.version=999;assert.throws(()=>normalizeState(s));s.version=1;s.users.push(structuredClone(s.users[0]));assert.throws(()=>normalizeState(s));
});
test('per-side entry, next-set memory, volume and legacy weights are consistent',()=>{
 const e={name:'Bench Press',barWeight:20};assert.deepEqual(entryDefaults(e,50),{input:15,bar:20});assert.equal(totalFor(15,20),50);
 assert.deepEqual(entryDefaults(e,15),{input:15,bar:null});assert.equal(platesFor(15,20),null);assert.deepEqual(entryDefaults({name:'Dumbbell Curl'},15),{input:15,bar:null});
 const s={kind:'strength',sets:[{exerciseId:'bench',weight:50,reps:12,barWeight:20}]};
 const next=nextSetDefaults(s,{exerciseId:'bench',weight:40,repsBySet:[12,10,8]});assert.equal(entryDefaults(e,next.weight).input,15);assert.equal(next.reps,10);assert.equal(sessionStats(s).volume,600);
 for(const w of [-1,NaN,Infinity])assert.throws(()=>totalFor(w,20));assert.throws(()=>totalFor(20,-1));assert.throws(()=>totalFor(500,20));
});
test('progress caps each exercise and excludes warmups and extra sets',()=>{
 const s={planned:[{exerciseId:'a',sets:2},{exerciseId:'a',sets:1},{exerciseId:'b',sets:3}],sets:[...Array.from({length:5},()=>({exerciseId:'a'})),{exerciseId:'b',warmup:true},{exerciseId:'c'}]};
 assert.deepEqual(workoutProgress(s),{completed:3,target:6,exercises:1,exerciseTarget:2,additional:3});
});
test('rest respects intensity, overrides, relaunch, warmups, past days and profiles',()=>{
 const s=normalizeState(createInitialState()),u=activeUser(s),now=Date.now();u.activeSession={id:'active',kind:'strength',startedAt:new Date(now).toISOString(),intensity:'vigorous',sets:[]};
 const set={exerciseId:'bench',warmup:false};assert.equal(restSeconds(u,'light'),60);assert.equal(restSeconds(u,'moderate'),60);assert.equal(restSeconds(u,'vigorous'),90);
 startRest(u,set,now);assert.equal(remainingRest(u.restTimer,now+25000),65);
 const reloaded=normalizeState(JSON.parse(JSON.stringify(s)));assert.equal(remainingRest(activeUser(reloaded).restTimer,now+30000),60);
 extendRest(u,now+30000);assert.equal(remainingRest(u.restTimer,now+30000),90);assert.equal(remainingRest(u.restTimer,now+999999),0);
 const old=structuredClone(u.restTimer);startRest(u,{...set,warmup:true},now);assert.deepEqual(u.restTimer,old);
 u.restTimer=null;u.restAutomatic=false;startRest(u,set,now);assert.equal(u.restTimer,null);
 u.restAutomatic=true;u.restDuration=60;assert.equal(restSeconds(u,'vigorous'),60);u.activeSession.startedAt='2020-01-01T12:00:00Z';startRest(u,set,now);assert.equal(u.restTimer,null);
 assert.equal(activeUser(normalizeState(createInitialState())).restTimer,undefined);
});
