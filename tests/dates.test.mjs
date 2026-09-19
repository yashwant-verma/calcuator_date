import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDate,shiftDate,todayIST,calculate,windowThrough,calendarEvent} from '../src/dates.mjs';
const now=new Date('2026-09-01T00:00:00Z');
test('60 calendar days rather than two months',()=>{
  assert.equal(calculate({journey:'2026-11-10'},now).opening,'2026-09-11');
  assert.equal(shiftDate('2027-04-30',-60),'2027-03-01');
});
test('leap day and year rollover',()=>{
  assert.equal(shiftDate('2028-04-29',-60),'2028-02-29');
  assert.equal(shiftDate('2027-01-15',-60),'2026-11-16');
});
test('day 2 boarding adjusts the origin before both calculations',()=>{
  assert.equal(calculate({journey:'2026-11-11',offset:1},now).opening,'2026-09-11');
  const r=calculate({journey:'2026-11-11',offset:1,mode:'tatkal'},now);
  assert.equal(r.opening,'2026-11-09');assert.equal(r.instant,'2026-11-09T04:30:00.000Z');
});
test('non-AC Tatkal uses 11 IST',()=>{
  assert.equal(calculate({journey:'2026-11-11',mode:'tatkal',travelClass:'nonac'},now).instant,'2026-11-10T05:30:00.000Z');
});
test('IST date changes at 18:30 UTC',()=>{
  assert.equal(todayIST(new Date('2026-09-13T18:29:59Z')),'2026-09-13');
  assert.equal(todayIST(new Date('2026-09-13T18:30:00Z')),'2026-09-14');
});
test('window only advances after 8 AM IST',()=>{
  assert.equal(windowThrough(new Date('2026-09-11T02:29:59Z')),'2026-11-09');
  assert.equal(windowThrough(new Date('2026-09-11T02:30:00Z')),'2026-11-10');
});
test('opening status switches precisely at the opening instant',()=>{
  assert.equal(calculate({journey:'2026-11-10'},new Date('2026-09-11T02:29:59Z')).status,'upcoming');
  assert.equal(calculate({journey:'2026-11-10'},new Date('2026-09-11T02:30:00Z')).status,'opened');
});
test('rejects impossible dates, stale journeys and unsupported modes',()=>{
  for(const d of ['2027-02-29','2026-02-30','2026-13-01','',null])assert.throws(()=>parseDate(d));
  assert.throws(()=>calculate({journey:'2026-08-31'},now));
  assert.throws(()=>calculate({journey:'2030-01-01'},now));
  for(const offset of [-1,7,1.5,'1'])assert.throws(()=>calculate({journey:'2026-11-10',offset},now));
  assert.throws(()=>calculate({journey:'2026-11-10',mode:'fake'},now));
});
test('calendar is portable UTC, 15-minute alert, CRLF endings',()=>{
  const ics=calendarEvent(calculate({journey:'2026-11-10'},now),now);
  assert.match(ics,/DTSTART:20260911T023000Z\r\n/);
  assert.match(ics,/DTEND:20260911T024500Z\r\n/);
  assert.match(ics,/TRIGGER:-PT15M/);assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(ics.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
});
