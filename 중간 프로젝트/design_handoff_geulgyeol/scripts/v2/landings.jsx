/* global React, GG_SAMPLE, GG_FEED, GG_ARCHIVE, GGIcon, GGNav, GGMark, GGStars */

/* ============================================================
   4개의 새 랜딩 페이지 방안 — 전형성에서 벗어난 접근들
   ============================================================ */

/* ─────────────────────────────────────────
   방안 01 — 「오늘의 글, 즉시」
   랜딩 자체가 곧 오늘의 글. CTA·헤드라인 없음.
   상단 1줄 라인만으로 정체를 드러내고, 스크롤 끝에서야
   "글결이란 무엇인가"가 조용히 등장.
───────────────────────────────────────── */
window.LandingImmediate = function LandingImmediate() {
  return (
    <div className="skin grain" style={{width:1440, minHeight:1700}}>
      {/* hairline header — 단 한 줄 */}
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

      {/* 본문 = 오늘의 글 그 자체 */}
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
        <div style={{display:"flex", justifyContent:"center", margin:"56px 0 32px", fontFamily:"var(--font-mono)", color:"var(--ink-4)", letterSpacing:"0.5em"}}>· · ·</div>
      </main>

      {/* 글이 끝난 자리에 — 조용한 소개 */}
      <section style={{maxWidth:760, margin:"0 auto", padding:"24px 0 64px", borderTop:"1px solid var(--rule)"}}>
        <div className="eyebrow muted" style={{marginBottom:24, paddingTop:48, textAlign:"center"}}>― 글결이란</div>
        <p style={{fontFamily:"var(--font-serif)", fontSize:22, lineHeight:1.85, color:"var(--ink-2)", textAlign:"center", margin:"0 auto 48px", maxWidth:560}}>
          매일 새벽 4시 12분, 한 편의 글이 도착합니다.<br/>
          광고도 알림도 없는 자리에서 나만의 속도로 읽고,<br/>
          마음에 들면 가만히 간직해두는 곳.
        </p>
        <div style={{display:"flex", gap:14, justifyContent:"center", marginBottom:80}}>
          <button style={{background:"var(--btn-bg)", color:"var(--btn-fg)", border:0, padding:"16px 28px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", display:"inline-flex", alignItems:"center", gap:10}}>
            글결 시작하기 <GGIcon name="arrow-right" size={14} color="var(--btn-fg)"/>
          </button>
          <button style={{background:"transparent", color:"var(--ink-deep)", border:"1px solid var(--rule-strong)", padding:"16px 24px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.10em"}}>이전 글 둘러보기</button>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:0, borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)"}}>
          {[["하루 한 편","무료로"],["3–5분","나만의 호흡"],["1,284명","오늘 함께 읽는 사람들"]].map(([k,v],i)=>(
            <div key={i} style={{padding:"32px 24px", borderLeft: i>0?"1px solid var(--rule)":0, textAlign:"center"}}>
              <div className="heading" style={{fontFamily:"var(--font-serif)", fontSize:32, letterSpacing:"-0.01em"}}>{k}</div>
              <div className="eyebrow faint" style={{marginTop:10}}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{padding:"32px 56px", borderTop:"1px solid var(--rule)", display:"flex", justifyContent:"space-between", fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.12em"}}>
        <span>GLEUL · GYUL — 글결 © 2026</span>
        <span>v0.1 / no.047</span>
      </footer>
    </div>
  );
};

/* ─────────────────────────────────────────
   방안 02 — 「아카이브 인덱스」
   도서관 카탈로그 카드 메타포.
   왼쪽에 일련번호 컬럼이 흐르고,
   가운데 큰 본문, 오른쪽 메타.
───────────────────────────────────────── */
window.LandingArchive = function LandingArchive() {
  return (
    <div className="skin grain" style={{width:1440, minHeight:1500}}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 56px", borderBottom:"1px solid var(--rule)", fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink-2)"}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <GGMark size={22} color="var(--ink-deep)"/>
          <span style={{fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-deep)", letterSpacing:"0.04em"}}>글결</span>
          <span className="eyebrow faint" style={{marginLeft:14}}>― 아카이브 / Archive</span>
        </div>
        <nav style={{display:"flex", gap:32}}><a>오늘</a><a style={{color:"var(--ink-deep)"}}>전체 글결</a><a>발견</a><a>로그인</a></nav>
      </header>

      <main style={{display:"grid", gridTemplateColumns:"180px 1fr 320px", borderBottom:"1px solid var(--rule)"}}>
        {/* 좌측 일련번호 인덱스 */}
        <aside style={{borderRight:"1px solid var(--rule)", padding:"56px 24px 56px 56px", fontFamily:"var(--font-mono)", fontSize:13, lineHeight:2.4, color:"var(--ink-3)", letterSpacing:"0.06em"}}>
          <div className="eyebrow muted" style={{marginBottom:20}}>― index</div>
          {GG_ARCHIVE.map(([no],i)=>(
            <div key={i} style={{color: i===0 ? "var(--ink-deep)" : "var(--ink-3)", display:"flex", alignItems:"center", gap:8}}>
              {i===0 && <span style={{color:"var(--accent)"}}>›</span>}
              <span>{no}</span>
            </div>
          ))}
        </aside>

        {/* 가운데 — 가장 큰 영역 */}
        <section style={{padding:"96px 56px 80px"}}>
          <div className="eyebrow accent" style={{marginBottom:36}}>― No. 047 / 오늘의 글결</div>
          <h1 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:96, fontWeight:400, lineHeight:1.05, letterSpacing:"-0.025em", margin:"0 0 40px"}}>
            안개가<br/>지나간 자리.
          </h1>
          <p style={{fontFamily:"var(--font-serif)", fontSize:21, lineHeight:1.85, color:"var(--ink-2)", maxWidth:540, margin:"0 0 56px"}}>
            새벽이 창을 두드릴 때, 나는 아직 잠의 끝자락을 붙들고 있었다.
            안개는 소리 없이 마당을 건너갔다 — 어떤 발자국도 남기지 않았다.
          </p>

          <div style={{display:"flex", gap:14, marginBottom:80}}>
            <button style={{background:"var(--btn-bg)", color:"var(--btn-fg)", border:0, padding:"18px 28px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.10em", display:"inline-flex", alignItems:"center", gap:10}}>
              펼쳐서 읽기 <GGIcon name="arrow-right" size={14} color="var(--btn-fg)"/>
            </button>
            <button style={{background:"transparent", color:"var(--ink-deep)", border:"1px solid var(--rule-strong)", padding:"18px 24px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.10em"}}>
              No. 046 ← 어제의 글
            </button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, borderTop:"1px solid var(--rule)"}}>
            {GG_ARCHIVE.slice(1,7).map(([no,cat,title,date],i)=>(
              <article key={i} style={{padding:"24px 0 20px", borderBottom:"1px solid var(--rule)", borderRight: (i%3<2)?"1px solid var(--rule)":0, paddingRight:24, paddingLeft: i%3>0?24:0}}>
                <div className="eyebrow faint" style={{marginBottom:8}}>No. {no} · {cat}</div>
                <h3 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:18, fontWeight:400, margin:"0 0 6px", letterSpacing:"-0.01em", lineHeight:1.4}}>{title}</h3>
                <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.1em"}}>{date}</div>
              </article>
            ))}
          </div>
        </section>

        {/* 우측 메타 카탈로그 카드 */}
        <aside style={{borderLeft:"1px solid var(--rule)", padding:"96px 32px 56px"}}>
          <div className="surface" style={{padding:"28px 24px", border:"1px solid var(--rule)"}}>
            <div className="eyebrow accent" style={{marginBottom:18}}>― 오늘의 카탈로그</div>
            <dl style={{margin:0, display:"grid", gridTemplateColumns:"auto 1fr", gap:"14px 16px", fontFamily:"var(--font-sans)", fontSize:12}}>
              {[["일련번호","No. 047"],["분류","고요"],["수록일","2026.04.27"],["분량","약 3분"],["저자","글결 큐레이션"],["보존","공식 아카이브"]].map(([k,v],i)=>(
                <React.Fragment key={i}>
                  <dt className="eyebrow faint" style={{whiteSpace:"nowrap"}}>{k}</dt>
                  <dd className="heading" style={{margin:0, fontFamily:"var(--font-serif)", fontSize:15, letterSpacing:"-0.005em"}}>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
            <hr className="hairline" style={{margin:"24px 0"}}/>
            <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.12em", lineHeight:1.6}}>
              ― 모든 글결은 일련번호로 보존됩니다.<br/>
              지나간 결도 다시 펼쳐 읽을 수 있어요.
            </div>
          </div>

          <div style={{marginTop:36, fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.12em", lineHeight:2}}>
            <div>― 1,284명이 오늘 함께</div>
            <div>― 47편 보존 중</div>
            <div>― 다음 글 / 04.28 새벽 5시</div>
          </div>
        </aside>
      </main>
    </div>
  );
};

/* ─────────────────────────────────────────
   방안 03 — 「숨 쉬는 한 문장」
   극단적 미니멀. 화면 한가운데에 한 문장만.
   주변에 거의 모든 것이 비어 있다.
   하단에 미세한 호흡 표시 (●).
───────────────────────────────────────── */
window.LandingBreath = function LandingBreath() {
  return (
    <div className="skin fog" style={{width:1440, minHeight:980, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column"}}>
      <GGStars count={50} w={1440} h={980} opacity={0.8}/>

      {/* 모서리 4개에만 정보 — 나머진 모두 비어있음 */}
      <div style={{position:"absolute", top:32, left:48, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.16em", display:"flex", alignItems:"center", gap:10, zIndex:2}}>
        <GGMark size={16} color="var(--ink-deep)"/>
        <span style={{fontFamily:"var(--font-serif)", fontSize:13, color:"var(--ink-deep)", letterSpacing:"0.04em"}}>글결</span>
      </div>
      <div style={{position:"absolute", top:32, right:48, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.16em", zIndex:2}}>
        2026 · 04 · 27 — 04:12
      </div>
      <div style={{position:"absolute", bottom:32, left:48, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.16em", zIndex:2}}>
        ― No. 047 / 고요
      </div>
      <div style={{position:"absolute", bottom:32, right:48, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.16em", display:"flex", gap:18, zIndex:2}}>
        <a style={{color:"var(--ink-deep)"}}>로그인</a>
        <a>가입</a>
      </div>

      {/* 가운데 한 문장 */}
      <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"0 64px", position:"relative", zIndex:1}}>
        <div className="eyebrow accent" style={{marginBottom:64, opacity:0.8}}>― 한 번 깊게, 호흡하세요</div>
        <p className="heading" style={{
          fontFamily:"var(--font-serif)", fontSize:72, fontWeight:300, lineHeight:1.4,
          textAlign:"center", maxWidth:1100, margin:0, letterSpacing:"-0.02em",
        }}>
          "사라진 것들이 사라졌음을<br/>
          우리는, 그것이 사라지고<br/>
          한참 뒤에야 안다."
        </p>

        {/* 호흡 인디케이터 — 점 3개 */}
        <div style={{marginTop:80, display:"flex", gap:16, alignItems:"center", color:"var(--ink-3)"}}>
          <div style={{width:6, height:6, borderRadius:"50%", background:"var(--accent)"}}/>
          <div style={{width:6, height:6, borderRadius:"50%", background:"var(--ink-4)"}}/>
          <div style={{width:6, height:6, borderRadius:"50%", background:"var(--ink-4)"}}/>
        </div>
        <div className="eyebrow faint" style={{marginTop:18}}>들숨 · 머묾 · 날숨</div>

        <div style={{marginTop:80, display:"flex", gap:14}}>
          <button style={{background:"var(--btn-bg)", color:"var(--btn-fg)", border:0, padding:"16px 28px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", display:"inline-flex", alignItems:"center", gap:10}}>
            오늘의 글 펼치기 <GGIcon name="arrow-right" size={14} color="var(--btn-fg)"/>
          </button>
        </div>

        <div style={{marginTop:48, fontFamily:"var(--font-serif)", fontSize:13, color:"var(--ink-3)", letterSpacing:"0.04em", fontStyle:"italic"}}>
          ― 「안개가 지나간 자리」 中
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   방안 04 — 「두 사람의 글방」
   PRD의 두 페르소나를 시각화.
   왼쪽 = 읽는 지연, 오른쪽 = 쓰는 민호.
   가운데 hairline으로 분리, 각자의 톤이 다름.
───────────────────────────────────────── */
window.LandingTwoRooms = function LandingTwoRooms() {
  return (
    <div className="skin" style={{width:1440, minHeight:1100, position:"relative"}}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 56px", borderBottom:"1px solid var(--rule)", fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink-2)"}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <GGMark size={22} color="var(--ink-deep)"/>
          <span style={{fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-deep)", letterSpacing:"0.04em"}}>글결</span>
        </div>
        <div className="eyebrow muted">― 글결은 두 사람을 위한 자리입니다</div>
        <nav style={{display:"flex", gap:24}}><a>로그인</a><a style={{color:"var(--ink-deep)"}}>시작하기</a></nav>
      </header>

      {/* 큰 카피 — 두 영역에 걸쳐있음 */}
      <section style={{padding:"96px 56px 56px", textAlign:"center"}}>
        <div className="eyebrow accent" style={{marginBottom:32}}>― 누구의 자리인가요</div>
        <h1 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:88, fontWeight:400, lineHeight:1.1, margin:"0 0 28px", letterSpacing:"-0.025em"}}>
          오늘은 <em style={{fontStyle:"italic", color:"var(--accent)"}}>읽는 사람</em>인가요,<br/>
          아니면 <em style={{fontStyle:"italic", color:"var(--accent)"}}>쓰는 사람</em>인가요.
        </h1>
        <p style={{fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-2)", maxWidth:560, margin:"0 auto", lineHeight:1.7}}>
          글결은 두 가지 마음 모두를 위한 자리입니다. 어느 쪽이든 들어와서, 잠시 쉬어가세요.
        </p>
      </section>

      {/* 두 방 — 좌/우 분할 */}
      <section style={{display:"grid", gridTemplateColumns:"1fr 1fr", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)", minHeight:520}}>
        {/* 왼쪽 — 읽는 사람 */}
        <div style={{padding:"56px 56px", borderRight:"1px solid var(--rule)", display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:36}}>
              <div style={{width:44, height:44, borderRadius:"50%", background:"var(--bg-3)", border:"1px solid var(--rule-strong)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-deep)"}}>지</div>
              <div>
                <div className="eyebrow accent">― 읽는 사람</div>
                <div className="heading" style={{fontFamily:"var(--font-serif)", fontSize:22, marginTop:4}}>지연 (28)</div>
              </div>
            </div>

            <h2 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:36, fontWeight:400, lineHeight:1.35, margin:"0 0 28px", letterSpacing:"-0.015em"}}>
              스크린샷 폴더에 마음들이<br/>흩어져 있어요.
            </h2>
            <p style={{fontFamily:"var(--font-serif)", fontSize:16, color:"var(--ink-2)", lineHeight:1.85, margin:0, maxWidth:480}}>
              SNS에서 만난 글귀가 1,000장의 스크린샷으로 잠들어 있다면 — 이곳에서 다시 찾을 수 있도록 옮겨드릴게요.
              하루 한 편의 글이 도착하고, 마음에 들면 가만히 간직됩니다.
            </p>
          </div>

          <div style={{marginTop:48}}>
            <button style={{background:"var(--btn-bg)", color:"var(--btn-fg)", border:0, padding:"16px 24px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", display:"inline-flex", alignItems:"center", gap:10}}>
              읽는 자리로 들어가기 <GGIcon name="arrow-right" size={14} color="var(--btn-fg)"/>
            </button>
            <div style={{display:"flex", gap:32, marginTop:32, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.1em"}}>
              <span>· 하루 1편 무료</span>
              <span>· 저장·아카이브</span>
              <span>· 감상 일기</span>
            </div>
          </div>
        </div>

        {/* 오른쪽 — 쓰는 사람 (살짝 다른 톤) */}
        <div style={{padding:"56px 56px", background:"var(--bg-2)", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative"}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:36}}>
              <div style={{width:44, height:44, borderRadius:"50%", background:"var(--bg-4)", border:"1px solid var(--rule-strong)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-deep)"}}>민</div>
              <div>
                <div className="eyebrow accent">― 쓰는 사람</div>
                <div className="heading" style={{fontFamily:"var(--font-serif)", fontSize:22, marginTop:4}}>민호 (24)</div>
              </div>
            </div>

            <h2 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:36, fontWeight:400, lineHeight:1.35, margin:"0 0 28px", letterSpacing:"-0.015em", fontStyle:"italic"}}>
              메모앱에 혼자 쓰는 문장들,<br/>가벼운 자리로 옮겨봐요.
            </h2>
            <p style={{fontFamily:"var(--font-serif)", fontSize:16, color:"var(--ink-2)", lineHeight:1.85, margin:0, maxWidth:480}}>
              블로그는 부담스럽고, 인스타는 노출이 무서운 사람을 위한 미니 에디터.
              제목 한 줄, 본문 600자. 익명으로 발견 피드에 띄우거나, 비공개로만 간직할 수도 있어요.
            </p>
          </div>

          <div style={{marginTop:48}}>
            <button style={{background:"transparent", color:"var(--ink-deep)", border:"1px solid var(--ink-deep)", padding:"16px 24px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", display:"inline-flex", alignItems:"center", gap:10}}>
              쓰는 자리로 들어가기 <GGIcon name="pen" size={14}/>
            </button>
            <div style={{display:"flex", gap:32, marginTop:32, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.1em"}}>
              <span>· 600자 미니 에디터</span>
              <span>· 공개 / 비공개</span>
              <span>· 익명 발행</span>
            </div>
          </div>
        </div>
      </section>

      {/* 하단 — 두 사람이 같은 자리에서 만난다 */}
      <section style={{padding:"72px 56px", textAlign:"center"}}>
        <div className="eyebrow muted" style={{marginBottom:24}}>― 그리고 두 사람이 같은 자리에서 만나는 곳</div>
        <p className="heading" style={{fontFamily:"var(--font-serif)", fontSize:38, fontWeight:400, lineHeight:1.4, margin:"0 0 32px", letterSpacing:"-0.015em"}}>
          누군가의 한 문장은,<br/>또 다른 누군가의 새벽이 됩니다.
        </p>
        <button style={{background:"transparent", color:"var(--ink-deep)", border:"1px solid var(--rule-strong)", padding:"14px 28px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.10em"}}>발견 피드 둘러보기 →</button>
      </section>
    </div>
  );
};
