/* global React, GG_SAMPLE, GG_FEED, GGIcon, GGNav, GGStars */

/* ============================================================
   Unified core screens — driven by data-theme on parent
   ============================================================ */

/* ---- Today (Reading) ---- */
window.UScreenToday = function UScreenToday() {
  return (
    <div className="skin grain fog" style={{width:1440, minHeight:1460, position:"relative", overflow:"hidden"}}>
      <GGStars count={50} w={1440} h={1460}/>
      <GGNav active="오늘"/>

      <main style={{padding:"96px 0 80px", maxWidth:780, margin:"0 auto", position:"relative", zIndex:1}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:56, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.16em", textTransform:"uppercase"}}>
          <span>{GG_SAMPLE.no}</span>
          <span style={{color:"var(--accent)"}}>― {GG_SAMPLE.category} ―</span>
          <span>{GG_SAMPLE.date}</span>
        </div>
        <h1 className="heading" style={{
          fontFamily:"var(--font-serif)", fontSize:56, fontWeight:400, lineHeight:1.25,
          margin:"0 0 12px", letterSpacing:"-0.018em",
        }}>{GG_SAMPLE.title}</h1>
        <div style={{fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink-3)", marginBottom:64, letterSpacing:"0.04em"}}>
          {GG_SAMPLE.byline}
        </div>
        <hr className="hairline" style={{marginBottom:56}}/>

        {GG_SAMPLE.body.map((line,i)=>(
          <p key={i} className={i===0 ? "heading" : ""} style={{
            fontFamily:"var(--font-serif)", fontSize:21, lineHeight:1.95,
            margin:"0 0 32px", textIndent: i===0 ? 0 : "2em",
          }}>{line}</p>
        ))}

        <div style={{display:"flex", justifyContent:"center", margin:"48px 0", fontFamily:"var(--font-mono)", color:"var(--ink-4)", letterSpacing:"0.5em"}}>· · ·</div>

        <div style={{display:"flex", gap:8, marginBottom:64, fontFamily:"var(--font-sans)", fontSize:12}}>
          {GG_SAMPLE.tags.map((t,i)=>(
            <span key={i} style={{padding:"6px 12px", border:"1px solid var(--rule-strong)", color:"var(--ink-2)", letterSpacing:"0.04em"}}>{t}</span>
          ))}
        </div>

        <div style={{
          padding:"28px 0", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)",
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0,
        }}>
          {[["bookmark","간직하기","저장 목록에 담기"],["pen","감상 남기기","나에게만 보이는 일기"],["share","조용히 보내기","링크 공유"]].map(([icon,label,sub],i)=>(
            <button key={i} style={{background:"transparent", border:0, cursor:"pointer", padding:"8px", textAlign:"left", borderLeft: i>0 ? "1px solid var(--rule)" : 0, display:"flex", alignItems:"flex-start", gap:14, color:"inherit"}}>
              <GGIcon name={icon} size={20} color="var(--ink-deep)"/>
              <div>
                <div style={{fontFamily:"var(--font-serif)", fontSize:16, color:"var(--ink-deep)", marginBottom:2}}>{label}</div>
                <div style={{fontFamily:"var(--font-sans)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.04em"}}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{textAlign:"center", marginTop:48, fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink-3)", letterSpacing:"0.06em"}}>
          {GG_SAMPLE.reads}
        </div>

        <div style={{display:"flex", justifyContent:"space-between", marginTop:96, paddingTop:24, borderTop:"1px solid var(--rule)", fontFamily:"var(--font-serif)"}}>
          <div style={{maxWidth:300}}>
            <div className="eyebrow faint" style={{marginBottom:8}}>어제의 글</div>
            <div style={{fontSize:18, color:"var(--ink)"}}>오늘은 잘 지지 않아도 돼</div>
          </div>
          <div style={{maxWidth:300, textAlign:"right"}}>
            <div className="eyebrow faint" style={{marginBottom:8}}>내일</div>
            <div style={{fontSize:18, color:"var(--ink-3)"}}>새벽 5시에 도착합니다</div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ---- Feed ---- */
window.UScreenFeed = function UScreenFeed() {
  const cats = ["전체","고요","위로","사랑","용기","그리움","사색"];
  return (
    <div className="skin grain" style={{width:1440, minHeight:1570}}>
      <GGNav active="발견"/>
      <main style={{padding:"72px 56px 0"}}>
        <section style={{display:"grid", gridTemplateColumns:"5fr 7fr", gap:64, marginBottom:56}}>
          <div>
            <div className="eyebrow accent" style={{marginBottom:24}}>― 발견 / Discover</div>
            <h2 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:60, fontWeight:400, lineHeight:1.1, margin:0, letterSpacing:"-0.02em"}}>
              조용히 누군가가<br/>
              <em style={{fontStyle:"italic", color:"var(--accent)"}}>남겨둔 문장들.</em>
            </h2>
          </div>
          <div style={{paddingTop:48}}>
            <p style={{fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-2)", lineHeight:1.7, margin:"0 0 24px"}}>
              매일 새벽, 글결의 사용자들이 다듬어 올린 글이 이곳에 머뭅니다. 마음에 드는 결을 발견하면 가만히 간직해두세요.
            </p>
            <div style={{display:"flex", gap:24, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.12em"}}>
              <span>오늘 새로 도착 · 12편</span>
              <span>이번 주 · 안개가 지나간 자리</span>
            </div>
          </div>
        </section>

        <div style={{display:"flex", gap:6, marginBottom:48, flexWrap:"wrap"}}>
          {cats.map((c,i)=>(
            <button key={i} style={{
              padding:"10px 18px",
              background: i===0 ? "var(--btn-bg)" : "transparent",
              color: i===0 ? "var(--btn-fg)" : "var(--ink-2)",
              border: i===0 ? "1px solid var(--btn-bg)" : "1px solid var(--rule-strong)",
              fontFamily:"var(--font-sans)", fontSize:12, letterSpacing:"0.06em",
            }}>{c}</button>
          ))}
          <span style={{flex:1}}/>
          <button style={{padding:"10px 18px", background:"transparent", color:"var(--ink-2)", border:"1px solid var(--rule)", fontFamily:"var(--font-sans)", fontSize:12, letterSpacing:"0.06em"}}>최신순 ↓</button>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"var(--rule)", border:"1px solid var(--rule)"}}>
          {GG_FEED.map((p,i)=>(
            <article key={i} style={{padding:"36px", background:"var(--bg)", minHeight:220, display:"grid", gridTemplateColumns:"auto 1fr auto", gap:32, alignItems:"center"}}>
              <div style={{fontFamily:"var(--font-mono)", fontSize:38, color:"var(--ink-3)", fontWeight:300, letterSpacing:"-0.02em"}}>{p.no}</div>
              <div>
                <div className="eyebrow accent" style={{marginBottom:12}}>― {p.cat}</div>
                <h3 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:24, fontWeight:400, margin:"0 0 12px", lineHeight:1.35, letterSpacing:"-0.01em"}}>{p.title}</h3>
                <p style={{fontFamily:"var(--font-serif)", fontSize:14, lineHeight:1.7, color:"var(--ink-2)", margin:"0 0 14px", maxWidth:480}}>
                  {i%3===0 && "안개는 소리 없이 마당을 건너갔다. 어떤 발자국도 남기지 않았다."}
                  {i%3===1 && "오늘의 당신을 토닥이는 한 마디, 가만히 두고 가요."}
                  {i%3===2 && "사라진 것들이 사라졌음을 우리는, 그것이 사라지고 한참 뒤에야 안다."}
                </p>
                <div style={{fontFamily:"var(--font-sans)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.06em"}}>{p.author} · {p.len}</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:14, alignItems:"center", color:"var(--ink-2)"}}>
                <GGIcon name={p.save?"bookmark-fill":"bookmark"} size={16} color={p.save?"var(--accent)":"currentColor"}/>
                <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:4}}>
                  <GGIcon name="heart" size={16}/>
                  <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)"}}>{p.likes}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{padding:"56px 0", textAlign:"center"}}>
          <button style={{background:"transparent", border:"1px solid var(--rule-strong)", padding:"14px 32px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.1em", color:"var(--ink)"}}>다음 결 펼치기 ↓</button>
        </div>
      </main>
    </div>
  );
};

/* ---- Editor ---- */
window.UScreenEditor = function UScreenEditor() {
  return (
    <div className="skin grain" style={{width:1440, minHeight:980}}>
      <GGNav active="쓰기"/>
      <main style={{padding:"72px 0", maxWidth:780, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:48, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.18em"}}>
          <span>― 새 글결 ―</span>
          <span>자동 저장 · 4분 전</span>
        </div>
        <input defaultValue="안개가 지나간 자리"
          style={{width:"100%", border:0, borderBottom:"1px solid var(--rule)", background:"transparent", padding:"12px 0", marginBottom:32,
            fontFamily:"var(--font-serif)", fontSize:46, fontWeight:400, color:"var(--ink-deep)", outline:"none", letterSpacing:"-0.015em"}}/>
        <div style={{display:"flex", gap:8, marginBottom:40, alignItems:"center"}}>
          <span className="eyebrow faint">― 결</span>
          {["고요","위로","사색"].map((t,i)=>(
            <span key={i} style={{padding:"4px 10px", border:"1px solid var(--rule-strong)", fontFamily:"var(--font-sans)", fontSize:11, color: i===0?"var(--accent)":"var(--ink-2)", letterSpacing:"0.04em"}}>#{t}</span>
          ))}
          <span style={{padding:"4px 10px", color:"var(--ink-3)", fontFamily:"var(--font-sans)", fontSize:11}}>+ 추가</span>
        </div>
        <textarea defaultValue={"새벽이 창을 두드릴 때, 나는 아직 잠의 끝자락을 붙들고 있었다.\n안개는 소리 없이 마당을 건너갔다. 어떤 발자국도 남기지 않았다.\n그러나 안개가 지나간 자리에는 분명, 무언가가 달라져 있었다."}
          style={{width:"100%", height:280, border:0, background:"transparent", fontFamily:"var(--font-serif)", fontSize:21, lineHeight:1.95, color:"var(--ink)", outline:"none", resize:"none"}}/>
        <div style={{padding:"24px 0", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:32}}>
          <div style={{display:"flex", gap:24, fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink-3)"}}>
            <span>본문 · 187 / 600자</span>
            <span>제목 · 11 / 40자</span>
          </div>
          <div style={{display:"flex", gap:6, fontFamily:"var(--font-sans)", fontSize:12}}>
            <button style={{padding:"8px 14px", background:"transparent", border:"1px solid var(--rule-strong)", color:"var(--ink-2)"}}>비공개</button>
            <button style={{padding:"8px 14px", background:"var(--accent)", color:"var(--btn-fg)", border:0}}>발견에 공개</button>
          </div>
        </div>
        <div style={{display:"flex", justifyContent:"flex-end", marginTop:32}}>
          <button style={{background:"var(--btn-bg)", color:"var(--btn-fg)", border:0, padding:"16px 32px", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", display:"inline-flex", alignItems:"center", gap:10}}>
            발행하기 <GGIcon name="arrow-right" size={14} color="var(--btn-fg)"/>
          </button>
        </div>
      </main>
    </div>
  );
};

/* ---- Profile ---- */
window.UScreenProfile = function UScreenProfile() {
  return (
    <div className="skin grain" style={{width:1440, minHeight:1100}}>
      <GGNav active="마이"/>
      <main style={{padding:"72px 56px 0"}}>
        <section style={{display:"grid", gridTemplateColumns:"4fr 8fr", gap:64, paddingBottom:64, borderBottom:"1px solid var(--rule)"}}>
          <div>
            <div style={{width:148, height:148, borderRadius:"50%", background:"var(--bg-3)", border:"1px solid var(--rule-strong)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-serif)", fontSize:60, color:"var(--ink-deep)", fontWeight:300, marginBottom:24}}>지</div>
            <div className="eyebrow accent" style={{marginBottom:6}}>― 글결 회원</div>
            <h1 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:42, fontWeight:400, margin:"0 0 8px", letterSpacing:"-0.01em"}}>지연</h1>
            <div style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", marginBottom:24, letterSpacing:"0.12em"}}>SINCE 2026 · 04 · 02</div>
            <p style={{fontFamily:"var(--font-serif)", fontSize:15, color:"var(--ink-2)", lineHeight:1.7, maxWidth:280}}>조용한 시간에 천천히 읽고 가끔 씁니다.</p>
          </div>
          <div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:1, background:"var(--rule)", border:"1px solid var(--rule)"}}>
              {[["간직한 글","48"],["쓴 글결","12"],["연속 읽기","17일"],["멤버십","무료"]].map(([k,v],i)=>(
                <div key={i} style={{padding:"28px 24px", background:"var(--bg)"}}>
                  <div className="eyebrow faint" style={{marginBottom:12}}>― {k}</div>
                  <div className="heading" style={{fontFamily:"var(--font-serif)", fontSize:36, letterSpacing:"-0.01em", fontWeight:400}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:36, display:"flex", gap:32, fontFamily:"var(--font-serif)", fontSize:16, paddingBottom:14, borderBottom:"1px solid var(--rule)"}}>
              <span style={{color:"var(--ink-deep)", borderBottom:"1px solid var(--accent)", paddingBottom:14, marginBottom:-15}}>간직한 글 (48)</span>
              <span style={{color:"var(--ink-2)"}}>내가 쓴 글 (12)</span>
              <span style={{color:"var(--ink-2)"}}>감상 일기 (23)</span>
            </div>
          </div>
        </section>
        <section style={{padding:"48px 0"}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:"var(--rule)", border:"1px solid var(--rule)"}}>
            {GG_FEED.slice(0,6).map((p,i)=>(
              <article key={i} style={{padding:"32px", background:"var(--bg)", minHeight:200}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:16}}>
                  <span className="eyebrow faint">No. {p.no}</span>
                  <GGIcon name="bookmark-fill" size={14} color="var(--accent)"/>
                </div>
                <div className="eyebrow accent" style={{marginBottom:12}}>― {p.cat}</div>
                <h3 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:22, fontWeight:400, margin:"0 0 14px", letterSpacing:"-0.01em", lineHeight:1.35}}>{p.title}</h3>
                <div style={{fontFamily:"var(--font-sans)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.06em"}}>{p.author} · 3월 {12+i}일에 간직함</div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

/* ---- Login ---- */
window.UScreenLogin = function UScreenLogin() {
  return (
    <div className="skin fog" style={{width:1440, minHeight:980, display:"grid", gridTemplateColumns:"1fr 1fr", overflow:"hidden", position:"relative"}}>
      <GGStars count={70} w={720} h={980}/>
      <section style={{padding:"56px 64px", display:"flex", flexDirection:"column", justifyContent:"space-between", borderRight:"1px solid var(--rule)", position:"relative", zIndex:1}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <GGMark size={24} color="var(--ink-deep)"/>
          <span style={{fontFamily:"var(--font-serif)", fontSize:19, color:"var(--ink-deep)", letterSpacing:"0.04em"}}>글결</span>
        </div>
        <div>
          <div className="eyebrow accent" style={{marginBottom:24}}>― 오늘의 글, No. 047</div>
          <p className="heading" style={{fontFamily:"var(--font-serif)", fontSize:40, lineHeight:1.5, margin:"0 0 24px", maxWidth:560, fontWeight:400, letterSpacing:"-0.015em"}}>
            "사라진 것들이 사라졌음을<br/>우리는, 그것이 사라지고<br/>한참 뒤에야 안다."
          </p>
          <div style={{fontFamily:"var(--font-sans)", fontSize:13, color:"var(--ink-3)", letterSpacing:"0.04em"}}>― 「안개가 지나간 자리」 中</div>
        </div>
        <div style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.16em"}}>2026 · 04 · 27 — 04:12</div>
      </section>
      <section style={{padding:"56px 64px", display:"flex", flexDirection:"column", justifyContent:"center", maxWidth:520, margin:"0 auto", width:"100%"}}>
        <div className="eyebrow accent" style={{marginBottom:32}}>― 다시 만났네요</div>
        <h2 className="heading" style={{fontFamily:"var(--font-serif)", fontSize:46, fontWeight:400, lineHeight:1.2, margin:"0 0 56px", letterSpacing:"-0.015em"}}>
          조용한 자리에<br/>오신 걸 환영해요.
        </h2>
        <div style={{marginBottom:24}}>
          <label className="eyebrow faint" style={{display:"block", marginBottom:8}}>이메일</label>
          <input defaultValue="jiyeon@geulgyeol.kr" style={{width:"100%", border:0, borderBottom:"1px solid var(--rule-strong)", background:"transparent", padding:"10px 0", fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-deep)", outline:"none"}}/>
        </div>
        <div style={{marginBottom:36}}>
          <label className="eyebrow faint" style={{display:"block", marginBottom:8}}>비밀번호</label>
          <input type="password" defaultValue="••••••••••" style={{width:"100%", border:0, borderBottom:"1px solid var(--rule-strong)", background:"transparent", padding:"10px 0", fontFamily:"var(--font-serif)", fontSize:18, color:"var(--ink-deep)", outline:"none", letterSpacing:"0.2em"}}/>
        </div>
        <button style={{background:"var(--btn-bg)", color:"var(--btn-fg)", border:0, padding:"16px 0", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.12em", marginBottom:14}}>글결로 들어가기</button>
        <button style={{background:"transparent", color:"var(--ink-deep)", border:"1px solid var(--rule-strong)", padding:"16px 0", fontFamily:"var(--font-sans)", fontSize:13, letterSpacing:"0.04em", display:"flex", alignItems:"center", justifyContent:"center", gap:10}}>
          <span style={{width:16, height:16, background:"var(--bg-3)", borderRadius:"50%"}}/>Google 계정으로 계속하기
        </button>
        <div style={{marginTop:48, paddingTop:24, borderTop:"1px solid var(--rule)", display:"flex", justifyContent:"space-between", fontFamily:"var(--font-sans)", fontSize:12, color:"var(--ink-3)"}}>
          <span>처음이신가요? <a style={{color:"var(--ink-deep)", textDecoration:"underline"}}>글결 시작하기</a></span>
          <a>비밀번호 찾기</a>
        </div>
      </section>
    </div>
  );
};
