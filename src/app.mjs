import {calculate, todayIST, shiftDate, windowThrough, calendarEvent} from './dates.mjs';
const hindi = document.documentElement.lang === 'hi';
const $ = id => document.getElementById(id);
const locale = hindi ? 'hi-IN' : 'en-IN';
const fmt = (value, options={}) => new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC',...options}).format(new Date(`${value}T00:00:00Z`));
const labels = hindi ? {upcoming:'बुकिंग खुलने में',opened:'बुकिंग खुलने की तारीख बीत चुकी है',today:'आज खुलेगी',days:'दिन',save:'कैलेंडर रिमाइंडर',copy:'तारीख कॉपी करें',copied:'बुकिंग की जानकारी कॉपी हो गई।',failed:'कॉपी नहीं हुआ। नीचे दी गई तारीख चुनकर कॉपी करें।',download:'रिमाइंडर फ़ाइल डाउनलोड हुई। इसे अपने कैलेंडर में खोलकर सेव करें।',invalid:'आज से अगले दो वर्षों के बीच सही यात्रा तारीख चुनें।',past:'खुल चुकी बुकिंग के लिए भविष्य का रिमाइंडर नहीं बनाया जा सकता।'} : {upcoming:'Opens in',opened:'Opening time has passed',today:'Opens today',days:'days',save:'Calendar reminder',copy:'Copy date',copied:'Booking details copied.',failed:'Could not copy. Select and copy the date shown above.',download:'Reminder downloaded. Open the file in your calendar and save the event.',invalid:'Choose a valid journey date from today through the next two years.',past:'The opening time has passed; a future reminder cannot be created.'};
let result=null;
let dirty=false;
const form=$('booking-form');
function currentMode(){return document.querySelector('[data-mode][aria-pressed="true"]')?.dataset.mode || 'advance';}
function refreshClock(){
  const now=new Date();
  if($('today-date')) $('today-date').textContent=fmt(todayIST(now));
  if($('window-date')) $('window-date').textContent=fmt(windowThrough(now));
  if($('ist-clock')) $('ist-clock').textContent=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:true}).format(now)+' IST';
  if(form){$('journey').min=todayIST(now);$('journey').max=shiftDate(todayIST(now),730);}
}
refreshClock();
if(form){
  $('journey').value=shiftDate(todayIST(),75);
  function read(){return {journey:$('journey').value,offset:Number($('boarding-day').value),mode:currentMode(),travelClass:$('travel-class').value};}
  function render(next){
    result=next;dirty=false;$('result-panel').classList.remove('invalid');
    $('error').textContent='';$('action-message').textContent='';
    $('opening-date').textContent=fmt(next.opening);
    $('opening-weekday').textContent=fmt(next.opening,{weekday:'long',day:undefined,month:undefined,year:undefined});
    $('opening-time').textContent=`${String(next.hour).padStart(2,'0')}:00 AM IST`;
    $('journey-result').textContent=fmt(next.journey);
    $('origin-result').textContent=fmt(next.origin);
    $('result-type').textContent=next.mode==='advance'?(hindi?'60 दिन पहले':'60-day advance'):(next.travelClass==='ac'?'Tatkal · AC':hindi?'तत्काल · Non-AC':'Tatkal · Non-AC');
    $('status').textContent=next.status==='opened'?labels.opened:next.opening===todayIST()?labels.today:`${labels.upcoming} ${Math.max(1,Math.round((new Date(next.opening)-new Date(todayIST()))/86400000))} ${labels.days}`;
    $('reminder').disabled=next.status==='opened';
    $('reminder').title=next.status==='opened'?labels.past:'';
    $('copy').disabled=false;
    return next;
  }
  function update(){try{return render(calculate(read()));}catch(error){result=null;dirty=true;$('error').textContent=hindi?labels.invalid:error.message;$('result-panel').classList.add('invalid');$('opening-date').textContent='—';$('opening-weekday').textContent='';$('opening-time').textContent='';$('status').textContent=hindi?'तारीख जाँचें':'Check your date';$('journey-result').textContent='—';$('origin-result').textContent='—';$('reminder').disabled=true;$('copy').disabled=true;return null;}}
  form.addEventListener('submit',event=>{event.preventDefault();update();});
  form.addEventListener('input',()=>{dirty=true;update();});
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    $('class-field').hidden=button.dataset.mode!=='tatkal';update();
  }));
  $('copy').addEventListener('click',async()=>{
    if(!result||dirty)return;
    const text=`RailDate: ${result.mode==='tatkal'?'Tatkal':'Advance'} booking ${fmt(result.opening)}, ${result.hour}:00 AM IST. Journey: ${fmt(result.journey)}. Train origin: ${fmt(result.origin)}. Check availability on IRCTC.`;
    try{await navigator.clipboard.writeText(text);$('action-message').textContent=labels.copied;}catch{$('action-message').textContent=labels.failed;}
  });
  $('reminder').addEventListener('click',()=>{
    const fresh=update();if(!fresh||fresh.status==='opened')return;
    const url=URL.createObjectURL(new Blob([calendarEvent(fresh)],{type:'text/calendar;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`raildate-${fresh.opening}.ics`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('action-message').textContent=labels.download;
  });
  update();
  const context=document.modelContext;
  if(context?.registerTool){
    const lifecycle=new AbortController();
    const registration={name:'calculate_booking_date',title:'Calculate train booking date',description:'Set the RailDate calculator and return the advance or Tatkal booking opening date. Does not book tickets or create reminders.',inputSchema:{type:'object',properties:{journey:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},offset:{type:'integer',minimum:0,maximum:6},mode:{type:'string',enum:['advance','tatkal']},travelClass:{type:'string',enum:['ac','nonac']}},required:['journey'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
      if(!input||typeof input!=='object'||Object.keys(input).some(key=>!['journey','offset','mode','travelClass'].includes(key)))throw new Error('Invalid calculator input.');
      const next=calculate(input);
      $('journey').value=next.journey;$('boarding-day').value=String(next.offset);$('travel-class').value=next.travelClass;
      document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next.mode)));
      $('class-field').hidden=next.mode!=='tatkal';return render(next);
    }};
    try{Promise.resolve(context.registerTool(registration,{signal:lifecycle.signal})).catch(()=>{});}catch{}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
  setInterval(()=>{refreshClock();if(result&&!dirty)update();},60000);
}else{setInterval(refreshClock,60000);}
