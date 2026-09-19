export const DAY = 86400000;
export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a valid date.');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Enter a valid calendar date.');
  return date;
}
export function shiftDate(value, days) { return new Date(parseDate(value).getTime() + days * DAY).toISOString().slice(0,10); }
export function todayIST(now = new Date()) { return new Date(now.getTime() + 330 * 60000).toISOString().slice(0,10); }
export function openingInstant(day, hour) { parseDate(day); return new Date(`${day}T${String(hour).padStart(2,'0')}:00:00+05:30`); }
export function calculate({journey, offset = 0, mode = 'advance', travelClass = 'ac'}, now = new Date()) {
  parseDate(journey);
  if (!Number.isInteger(offset) || offset < 0 || offset > 6) throw new Error('Choose a boarding day between 1 and 7.');
  if (!['advance','tatkal'].includes(mode) || !['ac','nonac'].includes(travelClass)) throw new Error('Choose a supported booking type and class.');
  if (journey < todayIST(now)) throw new Error('Choose today or a future journey date.');
  if (journey > shiftDate(todayIST(now), 730)) throw new Error('Choose a journey within the next two years.');
  const origin = shiftDate(journey, -offset);
  const opening = shiftDate(origin, mode === 'advance' ? -60 : -1);
  const hour = mode === 'advance' ? 8 : travelClass === 'ac' ? 10 : 11;
  const instant = openingInstant(opening, hour);
  return {journey, origin, opening, hour, mode, travelClass, offset, instant: instant.toISOString(), status: instant > now ? 'upcoming' : 'opened', days: Math.ceil((instant - now)/DAY)};
}
export function windowThrough(now = new Date()) {
  const today = todayIST(now);
  return shiftDate(today, now < openingInstant(today, 8) ? 59 : 60);
}
export function calendarEvent(result, now = new Date()) {
  const format = d => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const start = new Date(result.instant);
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//RailDate//Booking reminder//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    `UID:${result.opening}-${result.hour}-${result.journey}@raildate`, `DTSTAMP:${format(now)}`, `DTSTART:${format(start)}`,
    `DTEND:${format(new Date(start.getTime()+15*60000))}`, `SUMMARY:RailDate ${result.mode === 'tatkal' ? 'Tatkal' : 'advance'} booking opens`,
    `DESCRIPTION:Journey ${result.journey}. Train origin ${result.origin}. Verify quota and availability on IRCTC.`,
    'URL:https://www.irctc.co.in/nget/train-search','BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY','DESCRIPTION:Train booking opens in 15 minutes','END:VALARM','END:VEVENT','END:VCALENDAR',''].map(line=>line.match(/.{1,74}/g)?.join('\r\n ') ?? '').join('\r\n');
}
