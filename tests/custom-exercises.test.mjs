import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,activeUser,addCustomExercise,normalizeState,previousWeekExercise} from '../core.js';
import {entryDefaults,totalFor} from '../training.js';
test('custom equipment overrides names and survives backup without changing existing data',()=>{
 const s=createInitialState(),u=activeUser(s),old=structuredClone(u.programs);
 const d=addCustomExercise(u,{name:'  Barbell-looking name  ',equipment:'dumbbell'});
 const b=addCustomExercise(u,{name:'ท่าใหม่',equipment:'barbell',barWeight:15});
 assert.deepEqual(entryDefaults(d,12.5),{input:12.5,bar:null});
 assert.deepEqual(entryDefaults(b,35),{input:10,bar:15});assert.equal(totalFor(10,15),35);
 const r=normalizeState(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(r.users[0].exercises,u.exercises);assert.deepEqual(r.users[0].programs,old);
 assert.equal(activeUser(createInitialState()).exercises.some(e=>e.id===d.id),false);
});
test('invalid/duplicate custom exercises do not mutate the library; same name different equipment is allowed',()=>{
 const u=activeUser(createInitialState()),n=u.exercises.length;
 for(const args of [{name:' ',equipment:'dumbbell'},{name:'a'.repeat(81),equipment:'barbell'},{name:'a',equipment:'bad'},{name:'a',equipment:'barbell',barWeight:-1}])assert.throws(()=>addCustomExercise(u,args));
 assert.equal(u.exercises.length,n);addCustomExercise(u,{name:'Row',equipment:'dumbbell'});
 assert.throws(()=>addCustomExercise(u,{name:' row ',equipment:'dumbbell'}));
 addCustomExercise(u,{name:'Row',equipment:'barbell'});assert.equal(u.exercises.length,n+2);
});
test('last-week comparison preserves recorded dumbbell units and bar weight',()=>{
 const u=activeUser(createInitialState()),now=new Date(),last=new Date();last.setDate(last.getDate()-7);
 u.sessions=[{kind:'strength',startedAt:last.toISOString(),sets:[{exerciseId:'d',weight:12.5,reps:10,weightUnit:'per-hand'},{exerciseId:'b',weight:35,reps:8,barWeight:15}]}];
 assert.equal(previousWeekExercise(u,'d',now).weightUnit,'per-hand');assert.equal(previousWeekExercise(u,'b',now).barWeight,15);
});
