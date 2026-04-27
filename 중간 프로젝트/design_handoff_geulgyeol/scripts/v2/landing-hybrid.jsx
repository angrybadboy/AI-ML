/* global React, GG_SAMPLE, GGIcon, GGMark, GGStars */

/* ============================================================
   하이브리드 랜딩 — 「오늘의 글, 즉시」 × 「두 사람의 글방」
   
   설계 의도 :
   ① 첫 화면 : 곧바로 오늘의 글이 펼쳐진다 (방안 1의 정수)
      ― 헤드라인/CTA 없음, "글결이 무엇인지"보다 "글결이 무엇을 하는지"를 먼저 보여줌
   ② 글이 끝난 자리 : 조용한 갈림길로 두 페르소나가 등장 (방안 4)
      ― 같은 글을 두고 "오늘 당신은 읽는 사람인가, 쓰는 사람인가" 묻기
   ③ 그리고 두 사람이 만나는 곳 : 발견 피드 미리보기로 마무리
   
   결과 : 글로 시작해서 두 갈래로 갈라졌다가, 다시 한 자리로 모이는 호흡
   ============================================================ */

window.LandingHybrid = function LandingHybrid() {
  return (
    <div className="skin grain" style={{width:1440, minHeight:2680, position:"relative"}}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ⓞ 헤어라인 헤더 — 단 한 줄
          "오늘의 글이 이미 펼쳐져 있다"는 첫 메시지
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"22px 56px", borderBottom:"1px solid var(--rule)",
        fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.16em",
      }}>
        <span style={{display:"flex", alignItems:"center", gap:10}}>
          <GGMark size={18} color="var(--ink-deep)"/>
          <span style={{fontFamily:"var(--font-serif)", fontSize:14, color:"var(--ink-deep)", letterSpacing:"0.04em"}}>글결</span>
        </span>
        <span>― 글결에 오신 걸 환영합니다. 오늘의 글이 이미 펼쳐져 있어요.</span>
        <span><a style={{color:"var(--ink-deep)"}}>로그인</a> · <a>가입</a></span>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ① 본문 = 오늘의 글 그 자체
          PRD의 "0.5초 안에 첫 화면" 정신을 극단까지 — 
          랜딩이 곧 읽기 화면. 
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main style={{maxWidth:760, margin:"0 auto", padding:"104px 0 0"}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:64, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.18em"}}>
          <span>{GG_SAMPLE.no}</span>
          <span style={{color:"var(--accent)"}}>― {GG_SAMPLE.category} ―</span>
          <span>{GG_SAMPLE.date}</span>
        </div>
        <h1 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:64, fontWeight:400, lineHeight:1.2, margin:"0 0 16px", letterSpacing:"-0.02em"}}>
          {GG_SAMPLE.title}
        </h1>
        <div style={{fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink-3)", marginBottom:64, letterSpacing:"0.04em"}}>{GG_SAMPLE.byline}</div>
        <hr className="hairline" style={{marginBottom:56}}/>
        {GG_SAMPLE.body.map((line,i)=>(
          <p key={i} className={i===0?"heading":""} style={{fontFamily:"var(--font-serif)", fontSize:21, lineHeight:1.95, margin:"0 0 32px", textIndent:i===0?0:"2em"}}>{line}</p>
        ))}
        <div style={{display:"flex", justifyContent:"center", margin:"56px 0 0", fontFamily:"var(--font-mono)", color:"var(--ink-4)", letterSpacing:"0.5em"}}>· · ·</div>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ② 갈림길 — 글이 끝난 자리에서 두 페르소나가 등장
          큰 카피로 한 번 호흡을 끊고, 두 방으로 갈라진다.
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{maxWidth:1040, margin:"0 auto", padding:"112px 0 80px", textAlign:"center"}}>
        <div className="eyebrow accent" style={{marginBottom:32}}>― 그리고 이곳은</div>
        <h2 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:72, fontWeight:400, lineHeight:1.15, margin:"0 0 32px", letterSpacing:"-0.025em"}}>
          오늘 당신은 <em style={{fontStyle:"italic", color:"var(--accent)"}}>읽는 사람</em>인가요,<br/>
          아니면 <em style={{fontStyle:"italic", color:"var(--accent)"}}>쓰는 사람</em>인가요.
        </h2>
        <p style={{fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-2)", maxWidth:560, margin:"0 auto", lineHeight:1.7}}>
          글결은 두 가지 마음 모두를 위한 자리입니다.<br/>
          어느 쪽이든 들어와서, 잠시 쉬어가세요.
        </p>
      </section>

      {/* 두 방 — 좌(읽는 지연) / 우(쓰는 민호) */}
      <section style={{display:"grid", gridTemplateColumns:"1fr 1fr", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)", minHeight:560}}>
        {/* 왼쪽 — 읽는 사람 */}
        <div style={{padding:"64px 64px", borderRight:"1px solid var(--rule)", display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:36}}>
              <div style={{width:48, height:48, borderRadius:"50%", background:"var(--bg-3)", border:"1px solid var(--rule-strong)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-serif)", fontSize:20, color:"var(--ink-deep)"}}>지</div>
              <div>
                <div className="eyebrow accent">― 읽는 사람</div>
                <div className="heading" style={{fontFamily:"var(--font-serif)", fontSize:22, marginTop:4}}>지연 (28)</div>
              </div>
            </div>

            <h3 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:36, fontWeight:400, lineHeight:1.35, margin:"0 0 28px", letterSpacing:"-0.015em"}}>
              스크린샷 폴더에 마음들이<br/>흩어져 있어요.
            </h3>
            <p style={{fontFamily:"var(--font-serif)", fontSize:16, color:"var(--ink-2)", lineHeight:1.85, margin:0, maxWidth:480}}>
              SNS에서 만난 글귀가 1,000장의 스크린샷으로 잠들어 있다면 — 이곳에서 다시 찾을 수 있도록 옮겨드릴게요. 하루 한 편의 글이 도착하고, 마음에 들면 가만히 간직됩니다.
            </p>
          </div>

          <div style={{marginTop:48}}>
            <button style={{background:"var(--btn-bg)", color:"var(--btn-fg)", border:0, padding:"16px 24px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", display:"inline-flex", alignItems:"center", gap:10}}>
              읽는 자리로 들어가기 <GGIcon name="arrow-right" size={14} color="var(--btn-fg)"/>
            </button>
            <div style={{display:"flex", gap:24, marginTop:32, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.1em", flexWrap:"wrap"}}>
              <span>· 하루 1편 무료</span>
              <span>· 저장·아카이브</span>
              <span>· 감상 일기</span>
            </div>
          </div>
        </div>

        {/* 오른쪽 — 쓰는 사람 */}
        <div style={{padding:"64px 64px", background:"var(--bg-2)", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative"}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:36}}>
              <div style={{width:48, height:48, borderRadius:"50%", background:"var(--bg-4)", border:"1px solid var(--rule-strong)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-serif)", fontSize:20, color:"var(--ink-deep)"}}>민</div>
              <div>
                <div className="eyebrow accent">― 쓰는 사람</div>
                <div className="heading" style={{fontFamily:"var(--font-serif)", fontSize:22, marginTop:4}}>민호 (24)</div>
              </div>
            </div>

            <h3 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:36, fontWeight:400, lineHeight:1.35, margin:"0 0 28px", letterSpacing:"-0.015em", fontStyle:"italic"}}>
              메모앱 속 문장들,<br/>가벼운 자리로 옮겨봐요.
            </h3>
            <p style={{fontFamily:"var(--font-serif)", fontSize:16, color:"var(--ink-2)", lineHeight:1.85, margin:0, maxWidth:480}}>
              블로그는 부담스럽고, 인스타는 노출이 무서운 사람을 위한 미니 에디터. 제목 한 줄, 본문 600자. 익명으로 발견 피드에 띄우거나, 비공개로만 간직할 수도 있어요.
            </p>
          </div>

          <div style={{marginTop:48}}>
            <button style={{background:"transparent", color:"var(--ink-deep)", border:"1px solid var(--ink-deep)", padding:"16px 24px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", display:"inline-flex", alignItems:"center", gap:10}}>
              쓰는 자리로 들어가기 <GGIcon name="pen" size={14}/>
            </button>
            <div style={{display:"flex", gap:24, marginTop:32, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.1em", flexWrap:"wrap"}}>
              <span>· 600자 미니 에디터</span>
              <span>· 공개 / 비공개</span>
              <span>· 익명 발행</span>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ③ 두 사람이 만나는 곳 — 발견 피드 미리보기
          갈라졌던 두 흐름이 다시 한 자리로 모이는 마무리
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{padding:"96px 56px 64px", textAlign:"center"}}>
        <div className="eyebrow muted" style={{marginBottom:24}}>― 그리고 두 사람이 같은 자리에서 만나는 곳</div>
        <h2 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:46, fontWeight:400, lineHeight:1.35, margin:"0 0 16px", letterSpacing:"-0.015em"}}>
          누군가의 한 문장은,<br/>또 다른 누군가의 새벽이 됩니다.
        </h2>
        <p style={{fontFamily:"var(--font-serif)", fontSize:16, color:"var(--ink-3)", margin:"0 auto 56px", maxWidth:520, lineHeight:1.7}}>
          오늘 발견 피드에 도착한 12편의 글결을 잠시 둘러보세요.
        </p>

        {/* 발견 피드 미니 프리뷰 — 3개 카드 */}
        <div style={{maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:"var(--rule)", border:"1px solid var(--rule)", textAlign:"left"}}>
          {[
            {no:"047", cat:"고요", title:"안개가 지나간 자리", body:"안개는 소리 없이 마당을 건너갔다. 어떤 발자국도 남기지 않았다.", author:"지연", time:"3분"},
            {no:"046", cat:"위로", title:"오늘은 잘 지지 않아도 돼", body:"오늘의 당신을 토닥이는 한 마디, 가만히 두고 가요.", author:"민호", time:"2분"},
            {no:"045", cat:"사색", title:"나는 자주 질문이 된다", body:"사라진 것들이 사라졌음을, 우리는 한참 뒤에야 안다.", author:"글결", time:"4분"},
          ].map((p,i)=>(
            <article key={i} style={{padding:"32px 28px", background:"var(--bg)", minHeight:240, display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14}}>
                  <span className="eyebrow accent">― {p.cat}</span>
                  <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)"}}>No. {p.no}</span>
                </div>
                <h3 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:22, fontWeight:400, margin:"0 0 14px", lineHeight:1.35, letterSpacing:"-0.01em"}}>{p.title}</h3>
                <p style={{fontFamily:"var(--font-serif)", fontSize:14, lineHeight:1.7, color:"var(--ink-2)", margin:0}}>{p.body}</p>
              </div>
              <div style={{marginTop:24, paddingTop:16, borderTop:"1px solid var(--rule)", display:"flex", justifyContent:"space-between", fontFamily:"var(--font-sans)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.06em"}}>
                <span>― {p.author}</span>
                <span>{p.time}</span>
              </div>
            </article>
          ))}
        </div>

        <div style={{marginTop:48, display:"flex", justifyContent:"center", gap:14}}>
          <button style={{background:"transparent", color:"var(--ink-deep)", border:"1px solid var(--rule-strong)", padding:"14px 24px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.10em"}}>발견 피드 둘러보기 →</button>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          푸터 — 카탈로그 카드 식 메타
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{padding:"40px 56px 48px", borderTop:"1px solid var(--rule)", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.12em"}}>
        <span>GLEUL · GYUL — 글결 © 2026</span>
        <span style={{display:"flex", gap:24}}>
          <span>― 1,284명이 오늘 함께</span>
          <span>― 다음 글 / 04.28 새벽 5시</span>
        </span>
        <span>v0.2 / no.047</span>
      </footer>
    </div>
  );
};
