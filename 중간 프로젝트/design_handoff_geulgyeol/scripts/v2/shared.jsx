/* global React */
const { useState, useEffect, useMemo } = React;

window.GG_SAMPLE = {
  no: "No. 047",
  date: "2026 · 04 · 27",
  category: "고요",
  title: "안개가 지나간 자리",
  byline: "글결 큐레이션 · AI 보조 작성",
  body: [
    "새벽이 창을 두드릴 때, 나는 아직 잠의 끝자락을 붙들고 있었다.",
    "안개는 소리 없이 마당을 건너갔다. 어떤 발자국도 남기지 않았다.",
    "그러나 안개가 지나간 자리에는 분명, 무언가가 달라져 있었다.",
    "이파리 끝의 물방울. 흙의 냄새. 멀리서 우는 새의 음정.",
    "사라진 것들이 사라졌음을 우리는, 그것이 사라지고 한참 뒤에야 안다.",
  ],
  tags: ["#고요", "#새벽", "#안개", "#일상"],
  reads: "1,284명이 오늘 함께 읽었어요",
};

window.GG_FEED = [
  { no: "047", cat: "고요",   title: "안개가 지나간 자리",       author: "지연",  likes: 218, save: true,  len: "3분"  },
  { no: "046", cat: "위로",   title: "오늘은 잘 지지 않아도 돼",  author: "민호",  likes: 412, save: false, len: "2분"  },
  { no: "045", cat: "사랑",   title: "당신은 이미 충분합니다",     author: "글결",  likes: 305, save: true,  len: "4분"  },
  { no: "044", cat: "용기",   title: "한 걸음, 그 다음 한 걸음",   author: "현우",  likes: 187, save: false, len: "2분"  },
  { no: "043", cat: "고요",   title: "비가 내리는 오후의 책상",    author: "글결",  likes: 256, save: true,  len: "5분"  },
  { no: "042", cat: "그리움", title: "여름의 끝자락에서",          author: "수아",  likes: 174, save: false, len: "3분"  },
  { no: "041", cat: "위로",   title: "조용한 하루의 안부",         author: "글결",  likes: 391, save: true,  len: "3분"  },
  { no: "040", cat: "사색",   title: "나는 자주 질문이 된다",      author: "지연",  likes: 142, save: false, len: "4분"  },
];

window.GG_ARCHIVE = [
  ["047","고요","안개가 지나간 자리","2026.04.27"],
  ["046","위로","오늘은 잘 지지 않아도 돼","2026.04.26"],
  ["045","사랑","당신은 이미 충분합니다","2026.04.25"],
  ["044","용기","한 걸음, 그 다음 한 걸음","2026.04.24"],
  ["043","고요","비가 내리는 오후의 책상","2026.04.23"],
  ["042","그리움","여름의 끝자락에서","2026.04.22"],
  ["041","위로","조용한 하루의 안부","2026.04.21"],
  ["040","사색","나는 자주 질문이 된다","2026.04.20"],
  ["039","고요","겨울 아침의 첫 숨","2026.04.19"],
  ["038","사랑","말하지 않아도 닿는","2026.04.18"],
  ["037","사색","길 위에서 우리는","2026.04.17"],
  ["036","위로","무엇도 되지 않아도","2026.04.16"],
];

window.GGIcon = function GGIcon({name, size=16, stroke=1.25, color="currentColor", style={}}) {
  const s = {width:size, height:size, ...style};
  switch (name) {
    case "bookmark":      return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>);
    case "bookmark-fill": return (<svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={stroke}><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>);
    case "heart":         return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M12 20s-7-4.5-9.5-9C.7 7.5 3 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19 4 21.3 7.5 21.5 11c-2.5 4.5-9.5 9-9.5 9z"/></svg>);
    case "share":         return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M4 12v7h16v-7M12 3v13M7 8l5-5 5 5"/></svg>);
    case "pen":           return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M3 21l3-1 12-12-2-2L4 18l-1 3z"/><path d="M14 6l4 4"/></svg>);
    case "search":        return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>);
    case "arrow-right":   return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case "arrow-down":    return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M12 5v14M6 13l6 6 6-6"/></svg>);
    case "arrow-up":      return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M12 19V5M6 11l6-6 6 6"/></svg>);
    case "moon":          return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M20 14A8 8 0 1110 4a7 7 0 0010 10z"/></svg>);
    case "sun":           return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>);
    case "plus":          return (<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}><path d="M12 5v14M5 12h14"/></svg>);
    default: return null;
  }
};

window.GGMark = function GGMark({size=28, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15.25" stroke={color} strokeWidth="0.6"/>
      <text x="16" y="20.5" textAnchor="middle"
            fontFamily='"Noto Serif KR", serif'
            fontSize="14" fontWeight="500" fill={color} letterSpacing="-0.02em">결</text>
    </svg>
  );
};

/* ===== Shared NavBar (theme-aware) ===== */
window.GGNav = function GGNav({active="오늘"}) {
  const items = ["오늘","발견","아카이브","쓰기","마이"];
  return (
    <header style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"22px 56px", borderBottom:"1px solid var(--rule)",
      fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink-2)",
      position:"relative", zIndex:5,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <GGMark size={22} color="var(--ink-deep)"/>
        <span style={{fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-deep)", letterSpacing:"0.04em"}}>글결</span>
      </div>
      <nav style={{display:"flex", gap:32, letterSpacing:"0.04em"}}>
        {items.map((t,i)=>(
          <a key={i} style={{
            color: t===active ? "var(--ink-deep)" : "var(--ink-2)",
            paddingBottom: 4,
            borderBottom: t===active ? "1px solid var(--accent)" : "1px solid transparent",
          }}>{t}</a>
        ))}
      </nav>
      <div style={{display:"flex", gap:18, alignItems:"center"}}>
        <GGIcon name="search" size={15}/>
        <div style={{width:30, height:30, borderRadius:"50%", background:"var(--bg-2)", border:"1px solid var(--rule-strong)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-serif)", fontSize:13, color:"var(--ink)"}}>지</div>
      </div>
    </header>
  );
};

/* small starfield (used in dark mode) */
window.GGStars = function GGStars({count=60, w=1440, h=400, opacity=1}) {
  const stars = useMemo(()=>Array.from({length:count}, ()=>({
    cx: (Math.random()*w).toFixed(1),
    cy: (Math.random()*h).toFixed(1),
    r: (0.3 + Math.random()*1.2).toFixed(2),
    o: (0.15 + Math.random()*0.55).toFixed(2),
  })),[count,w,h]);
  return (
    <svg width={w} height={h} style={{position:"absolute", inset:0, pointerEvents:"none", opacity:`calc(var(--is-dark) * ${opacity})`}}>
      {stars.map((s,i)=>(<circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="var(--ink-deep)" opacity={s.o}/>))}
    </svg>
  );
};
