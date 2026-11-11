import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,normalizeState,cardioInputs} from '../core.js';
const restore=s=>normalizeState(s,{importing:true});
test('numeric and markup-bearing restore fields are rejected in every profile',()=>{
  for (const key of ['bodyWeight','speed','distance','incline','minutes']) {
    const s=createInitialState(), u=structuredClone(s.users[0]);u.id='second';s.users.push(u);
    if(key==='bodyWeight')u[key]='"><img src=x>';
    else u.programs[0].days[0]={mode:'cardio',cardio:{activity:'walking',minutes:10,[key]:'"><img src=x>'}};
    assert.throws(()=>restore(s),/invalid-backup/);
  }
});
test('only cardio inputs can cross from a plan into an active session',()=>{
  const c={activity:'walking',minutes:20,kind:'strength',id:'forged',planned:[{}],sets:[{}]};
  const s=createInitialState();s.users[0].programs[0].days[0]={mode:'cardio',cardio:c};
  const clean=restore(s).users[0].programs[0].days[0].cardio;
  assert.deepEqual(clean,{activity:'walking',minutes:20});assert.deepEqual(cardioInputs(c),clean);
});
test('damaged theme cannot break startup; oversized active-session expansion rejected',()=>{
  const s=createInitialState(), u=s.users[0];s.settings.theme={toString:null};
  assert.equal(restore(s).settings.theme,'cool');
  const item={exerciseId:'bench-press',weight:40,sets:3,repsBySet:[12,10,8]};
  u.activeSession={id:'active',startedAt:new Date().toISOString(),kind:'strength',planned:Array(100).fill(item),sets:Array(50).fill({exerciseId:item.exerciseId,weight:40,reps:10})};
  assert.throws(()=>restore(s),/invalid-backup/);u.activeSession.planned=[item,item];assert.equal(restore(s).users[0].activeSession.planned.length,2);
});
test('ids used by destructive actions must identify a single record',()=>{
  const s=createInitialState(), u=s.users[0];
  u.programs[1].id=u.programs[0].id;assert.throws(()=>restore(s),/invalid-backup/);
  u.programs.pop();const legacy={exerciseId:'bench-press',weight:40,reps:8};
  u.activeSession={id:'a',kind:'strength',startedAt:new Date().toISOString(),sets:[legacy,{...legacy}]};
  const sets=restore(s).users[0].activeSession.sets;assert.ok(sets[0].id);assert.notEqual(sets[0].id,sets[1].id);
  u.activeSession.sets.forEach(set=>set.id='collision');assert.throws(()=>restore(s),/invalid-backup/);
});
