/* global React */
const { useState: useStateSC } = React;

/* ============================================================
   System Card v2 — Light + Dark unified system
   ============================================================ */
window.SystemCardV2 = function SystemCardV2() {
  const ramp = ["--bg","--bg-2","--bg-3","--bg-4","--ink-3","--ink-2","--ink","--ink-deep"];
  return (
    <div className="skin grain" style={{width:1440, minHeight:1100, padding:"56px 64px", fontFamily:"var(--font-sans)"}}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", paddingBottom:32, borderBottom:"1px solid var(--rule)", marginBottom:48}}>
        <div>
          <div className="eyebrow muted" style={{marginBottom:14}}>― 글결 / 디자인 시스템 v0.2 — 라이트 · 다크 통합</div>
          <h1 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:64, fontWeight:400, margin:0, letterSpacing:"-0.025em", lineHeight:1.1}}>
            하나의 결, <em style={{fontStyle:"italic", color:"var(--accent)"}}>두 가지 빛.</em>
          </h1>
          <p style={{fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-2)", maxWidth:780, lineHeight:1.7, marginTop:18}}>
            새벽 안개와 밤하늘 잉크를 하나의 토큰 시스템으로 합쳤습니다. <code style={{fontFamily:"var(--font-mono)", fontSize:14}}>data-theme</code>으로 전환하면 모든 화면이 같은 결을 유지하면서 빛을 바꿔 입어요.
          </p>
        </div>
        <div style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.12em", textAlign:"right"}}>
          ― 우측 상단 / 토글로 빛 바꾸기<br/>― ☀ ↔ ☾
        </div>
      </header>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, marginBottom:56}}>
        <section>
          <div className="eyebrow accent" style={{marginBottom:16}}>― 톤 램프 / 8 steps</div>
          <div style={{display:"flex", gap:0, height:64, border:"1px solid var(--rule)"}}>
            {ramp.map((c,i)=>(<div key={i} style={{flex:1, background:`var(${c})`}}/>))}
          </div>
          <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--ink-3)", letterSpacing:"0.08em"}}>
            <span>bg</span><span>bg-2</span><span>bg-3</span><span>bg-4</span><span>ink-3</span><span>ink-2</span><span>ink</span><span>ink-deep</span>
          </div>
        </section>
        <section>
          <div className="eyebrow accent" style={{marginBottom:16}}>― 액센트 / cool blue</div>
          <div style={{display:"flex", gap:12, alignItems:"center"}}>
            <div style={{width:64, height:64, background:"var(--accent)"}}/>
            <div style={{width:64, height:64, background:"var(--accent-soft)"}}/>
            <div style={{flex:1, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.06em", lineHeight:1.8}}>
              ― light : #4A6B8A / 6E8AA6<br/>
              ― dark  : #8FA8C2 / 5C7390<br/>
              ― 같은 hue, 빛에 따라 명도만 이동
            </div>
          </div>
        </section>
      </div>

      <section style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)"}}>
        {[
          ["TYPE","Noto Serif KR + Inter Tight + JetBrains Mono. 본문 21px / 1.95 줄간."],
          ["MOTION","페이드인 0.8s ease-out · 잉크 번짐 · 별빛 호흡"],
          ["LAYOUT","8px 그리드 · 1440 데스크탑 · 모바일 360 / 768 확장 준비"],
        ].map(([k,v],i)=>(
          <div key={i} style={{padding:"32px 24px", borderLeft: i>0?"1px solid var(--rule)":0}}>
            <div className="eyebrow faint" style={{marginBottom:14}}>― {k}</div>
            <p style={{fontFamily:"var(--font-serif)", fontSize:15, color:"var(--ink-2)", lineHeight:1.7, margin:0}}>{v}</p>
          </div>
        ))}
      </section>

      <section style={{marginTop:48, paddingTop:32, borderTop:"1px solid var(--rule)"}}>
        <div className="eyebrow muted" style={{marginBottom:24}}>― 4개의 새 랜딩 방안 / Landing Variants</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:1, background:"var(--rule)", border:"1px solid var(--rule)"}}>
          {[
            ["01","오늘의 글, 즉시","랜딩이 곧 오늘의 글. CTA·헤드라인 없이 글이 첫 화면. 스크롤 끝에서야 정체가 드러남."],
            ["02","아카이브 인덱스","도서관 카탈로그 메타포. 좌측 일련번호 컬럼 · 가운데 본문 · 우측 메타 카드."],
            ["03","숨 쉬는 한 문장","극단적 미니멀. 화면 한가운데 한 문장만. 호흡 인디케이터로 들숨·머묾·날숨."],
            ["04","두 사람의 글방","페르소나 시각화. 좌(읽는 지연) / 우(쓰는 민호). 같은 자리에서 두 마음이 만남."],
          ].map(([no,t,d],i)=>(
            <div key={i} style={{padding:"28px", background:"var(--bg)"}}>
              <div className="eyebrow accent" style={{marginBottom:14}}>― {no}</div>
              <h3 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:20, fontWeight:400, margin:"0 0 14px", letterSpacing:"-0.01em"}}>{t}</h3>
              <p style={{fontFamily:"var(--font-serif)", fontSize:14, color:"var(--ink-2)", lineHeight:1.7, margin:0}}>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
