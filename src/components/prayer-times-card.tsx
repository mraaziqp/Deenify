'use client';

import { useState, useEffect } from 'react';

interface PrayerTime { name: string; arabic: string; time: string; icon: string; }
const ICONS: Record<string,string> = { Fajr:'🌙',Sunrise:'🌅',Dhuhr:'☀️',Asr:'🌤️',Maghrib:'🌇',Isha:'⭐' };
const AR: Record<string,string> = { Fajr:'الفجر',Sunrise:'الشروق',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء' };
const NAMES = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'] as const;
const RT: Record<number,[string,string,string,string,string,string]> = {
  1:['05:04','06:30','13:03','16:40','20:50','21:55'],2:['05:05','06:31','13:03','16:39','20:49','21:54'],
  3:['05:07','06:32','13:03','16:39','20:48','21:54'],4:['05:08','06:32','13:03','16:39','20:46','21:53'],
  5:['05:09','06:33','13:03','16:38','20:44','21:51'],6:['05:10','06:33','13:02','16:38','20:42','21:49'],
  7:['05:11','06:34','13:02','16:37','20:40','21:47'],8:['05:12','06:35','13:02','16:37','20:40','21:47'],
  9:['05:13','06:35','13:02','16:36','20:38','21:45'],10:['05:14','06:36','13:02','16:36','20:38','21:45'],
  11:['05:15','06:36','13:01','16:35','20:37','21:44'],12:['05:16','06:37','13:01','16:34','20:35','21:42'],
  13:['05:17','06:37','13:01','16:34','20:34','21:41'],14:['05:18','06:38','13:01','16:33','20:32','21:39'],
  15:['05:19','06:38','13:01','16:32','20:31','21:38'],16:['05:20','06:39','13:00','16:31','20:30','21:37'],
  17:['05:21','06:39','13:00','16:31','20:28','21:35'],18:['05:22','06:40','13:00','16:30','20:27','21:34'],
  19:['05:23','06:40','13:00','16:30','20:25','21:32'],20:['05:24','06:41','13:00','16:29','20:24','21:31'],
  21:['05:25','06:41','12:59','16:28','20:22','21:29'],22:['05:26','06:42','12:59','16:28','20:21','21:27'],
  23:['05:27','06:42','12:59','16:27','20:20','21:27'],24:['05:28','06:43','12:58','16:26','20:18','21:25'],
  25:['05:29','06:43','12:58','16:25','20:17','21:24'],26:['05:30','06:44','12:58','16:25','20:15','21:22'],
  27:['05:31','06:44','12:58','16:24','20:14','21:21'],28:['05:31','06:44','12:58','16:23','20:12','21:19'],
  29:['05:32','06:45','12:57','16:22','20:11','21:18'],30:['05:33','06:45','12:57','16:21','20:10','21:17'],
};
function fallback(): PrayerTime[] {
  const diff = Math.floor((Date.now()-new Date(2026,1,19).getTime())/86400000)+1;
  const d = Math.min(Math.max(diff,1),30);
  const t = RT[d]??RT[1];
  return NAMES.map((n,i)=>({name:n,arabic:AR[n],time:t[i],icon:ICONS[n]}));
}

export function PrayerTimesCard() {
  const [clk,setClk]=useState('');
  const [times,setTimes]=useState<PrayerTime[]>([]);
  const [next,setNext]=useState('');
  const [loading,setLoading]=useState(true);
  const [hDate,setHDate]=useState('');
  const [rDay,setRDay]=useState<number|null>(null);

  useEffect(()=>{
    (async()=>{
      try{
        const now=new Date();
        const r=await fetch(`https://api.aladhan.com/v1/timingsByCity/${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}?city=Cape+Town&country=South+Africa&method=2`);
        if(!r.ok)throw new Error();
        const d=await r.json();
        const T=d?.data?.timings,h=d?.data?.date?.hijri;
        if(T){const f=(s:string)=>s.slice(0,5);setTimes(NAMES.map((n,i)=>({name:n,arabic:AR[n],time:f(T[NAMES[i]]),icon:ICONS[n]})));}
        if(h){setHDate(`${h.day} ${h.month.en} ${h.year} AH`);if(h.month.number===9)setRDay(parseInt(h.day));}
      }catch{
        setTimes(fallback());
        const diff=Math.floor((Date.now()-new Date(2026,1,19).getTime())/86400000)+1;
        if(diff>=1&&diff<=30)setRDay(diff);
      }finally{setLoading(false);}
    })();
  },[]);

  useEffect(()=>{
    function tick(){
      const now=new Date();
      setClk(now.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Africa/Johannesburg'}));
      if(!times.length)return;
      const m=now.getHours()*60+now.getMinutes();
      const nx=times.find(p=>{if(p.name==='Sunrise')return false;const[h,min]=p.time.split(':').map(Number);return h*60+min>m;});
      setNext(nx?.name??'Fajr');
    }
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[times]);

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl">
      {/* Dark Islamic gradient header */}
      <div className="relative overflow-hidden px-6 py-5" style={{background:'linear-gradient(160deg,#0a4a36 0%,#0d6e50 55%,#1a5a6a 100%)'}}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{background:'radial-gradient(circle,#d4af37 0%,transparent 70%)'}}/>
        <div className="absolute top-2 right-4 select-none" style={{color:'rgba(251,191,36,0.18)',fontSize:'3.5rem'}}>✦</div>
        <div className="absolute bottom-2 left-20 select-none" style={{color:'rgba(251,191,36,0.1)',fontSize:'2.5rem'}}>✦</div>
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">☪️</span>
                <h2 className="text-white font-bold text-xl tracking-tight">Prayer Times</h2>
              </div>
              <p className="text-emerald-200 text-xs">📍 Cape Town, South Africa</p>
              {hDate&&<p className="text-yellow-300 text-xs mt-0.5 font-medium">{hDate}</p>}
            </div>
            <div className="text-right">
              <p className="text-white font-bold tabular-nums" style={{fontSize:'1.45rem',letterSpacing:'-0.02em'}}>{clk||'——:——'}</p>
              {rDay&&(
                <span className="inline-block text-yellow-200 text-xs px-2.5 py-0.5 rounded-full mt-1" style={{background:'rgba(251,191,36,0.15)',border:'1px solid rgba(251,191,36,0.3)'}}>
                  🌙 Ramadan Day {rDay}
                </span>
              )}
            </div>
          </div>
          {next&&!loading&&(
            <div className="mt-4 flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)'}}>
              <span className="text-xl">{ICONS[next]}</span>
              <div>
                <p className="text-xs" style={{color:'rgba(255,255,255,0.65)'}}>Next prayer</p>
                <p className="text-white font-bold text-sm">{next} · {times.find(p=>p.name===next)?.time}</p>
              </div>
              <div className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"/>
            </div>
          )}
        </div>
      </div>

      {/* Prayer time rows */}
      <div className="bg-white" style={{borderTop:'1px solid rgba(16,185,129,0.08)'}}>
        {loading
          ?[...Array(6)].map((_,i)=>(
              <div key={i} className="mx-4 my-2 h-12 rounded-xl" style={{background:'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.6s infinite'}}/>
            ))
          :times.map(p=>{
            const isN=p.name===next&&p.name!=='Sunrise';
            const isSr=p.name==='Sunrise';
            return(
              <div
                key={p.name}
                style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'0.875rem 1.25rem',
                  background:isN?'linear-gradient(to right,rgba(16,185,129,0.08),rgba(16,185,129,0.04))':'',
                  borderLeft:isN?'3px solid #059669':'3px solid transparent',
                  opacity:isSr?0.5:1,
                  borderBottom:'1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
                  <div style={{width:'2.25rem',height:'2.25rem',borderRadius:'0.6rem',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',background:isN?'#d1fae5':'#f9fafb'}}>
                    {p.icon}
                  </div>
                  <div>
                    <p style={{fontWeight:600,fontSize:'0.875rem',color:isN?'#065f46':'#1f2937',lineHeight:1.2}}>{p.name}</p>
                    <p style={{fontFamily:'Scheherazade New,Amiri,serif',fontSize:'0.95rem',color:isN?'#059669':'#9ca3af',lineHeight:1}}>{p.arabic}</p>
                  </div>
                  {isN&&<span style={{fontSize:'0.65rem',fontWeight:700,background:'#059669',color:'white',padding:'0.15rem 0.5rem',borderRadius:'999px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Next</span>}
                </div>
                <p style={{fontWeight:700,fontSize:'1.15rem',fontVariantNumeric:'tabular-nums',color:isN?'#059669':isSr?'#9ca3af':'#374151'}}>{p.time}</p>
              </div>
            );
          })
        }
      </div>

      {/* Footer */}
      <div style={{background:'rgba(6,95,70,0.04)',borderTop:'1px solid rgba(16,185,129,0.12)',padding:'0.625rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <p style={{fontSize:'0.7rem',color:'#9ca3af'}}>Aladhan API · MJC method</p>
        <p style={{fontSize:'0.75rem',color:'#059669',fontWeight:600,fontFamily:'Scheherazade New,Amiri,serif'}}>رمضان مبارك 🌙</p>
      </div>
    </div>
  );
}
