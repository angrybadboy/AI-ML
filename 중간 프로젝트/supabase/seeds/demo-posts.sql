-- ============================================================
-- 글결 — Phase 5 시연용 사용자 글 6편 시드
-- 가장 최근 가입한 두 사용자에게 3편씩 분배. 이미 시드가 있으면 skip.
-- 발견 피드와 마이페이지 시연을 풍성하게 만들기 위함.
-- 모두 'demo-seed' 태그가 붙어있어 나중에 한 번에 정리 가능.
-- ============================================================

do $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_existing int;
begin
  -- 중복 시드 방지
  select count(*) into v_existing
  from public.user_posts
  where 'demo-seed' = ANY(tags);

  if v_existing > 0 then
    raise notice '이미 demo-seed 글이 % 편 있습니다. 중복 시드 skip.', v_existing;
    return;
  end if;

  -- 최근 가입한 두 사용자를 A, B로
  select id into v_user_a
  from auth.users
  order by created_at desc
  offset 0 limit 1;
  select id into v_user_b
  from auth.users
  order by created_at desc
  offset 1 limit 1;

  if v_user_a is null or v_user_b is null then
    raise exception '시드를 적용하려면 auth.users에 최소 2명이 필요합니다. /signup 에서 두 계정을 만들고 다시 실행하세요.';
  end if;

  raise notice '시드 대상: A=%, B=%', v_user_a, v_user_b;

  -- A 의 글 3편
  insert into public.user_posts (user_id, title, body, category, visibility, tags, like_count) values
  (v_user_a,
   '오후 세 시의 빛',
   E'창으로 들어온 빛이 책상 모서리에 닿아 있었다.\n그 빛은 어제와 같은 빛이 아니었지만, 어제와 똑같은 자리에 닿아 있었다.\n오후 세 시는 내가 가장 자주 잊어버리는 시간이다.\n잊어버려서 자유로운 시간이기도 하다.',
   '사색', 'public',
   array['demo-seed', '오후', '빛'],
   18),

  (v_user_a,
   '어제 본 새들의 자리',
   E'이른 아침 마당에 앉아 있던 새들이 오늘은 보이지 않았다.\n같은 자리, 같은 시간. 그러나 부재가 그 자리를 채우고 있었다.\n사라진 것들은 자신이 사라졌음을 알리지 않는다.\n그것이 그들의 마지막 예의일지도 모른다.',
   '그리움', 'public',
   array['demo-seed', '새', '자리'],
   9),

  (v_user_a,
   '이름 없는 한 사람의 기록',
   E'오늘 나는 누구의 이름도 부르지 않았다.\n누구도 나를 부르지 않은 하루.\n조용했고, 조용해서 충분했다.\n이름 없이도 살아낸 하루가, 어쩌면 가장 정직한 하루일지 모른다.',
   '위로', 'private',
   array['demo-seed', '이름', '하루'],
   0);

  -- B 의 글 3편
  insert into public.user_posts (user_id, title, body, category, visibility, tags, like_count) values
  (v_user_b,
   '겨울이 지난 자리에',
   E'겨울이 갔다고 누가 말했다.\n그래도 나는 한참을 더 두꺼운 옷을 손에서 놓지 못했다.\n계절은 사람의 속도와 다르게 흐르고, 마음은 늘 한 박자 늦게 따라간다.\n그래도 결국엔 따라가게 되더라.',
   '그리움', 'public',
   array['demo-seed', '계절', '늦게'],
   22),

  (v_user_b,
   '잠 못 든 새벽의 적바림',
   E'새벽 두 시. 나는 또 천장의 무늬를 세고 있었다.\n같은 무늬를, 같은 순서로, 다른 마음으로.\n어떤 밤은 잠을 청하는 밤이 아니라 그냥 같이 있는 밤이다.\n나와 새벽이 서로 깨어 있는 채로.',
   '사색', 'public',
   array['demo-seed', '새벽', '잠'],
   7),

  (v_user_b,
   '어머니의 손글씨를 따라',
   E'오래된 노트에서 어머니의 손글씨를 발견했다.\n그 글씨는 한 글자씩 또박또박 적혀 있었다. 빠르게 적은 글씨가 아니었다.\n나는 한참 그 글씨를 따라 적어 보았다. 손이 모양을 기억하는 데는 시간이 걸렸다.\n사랑은 어쩌면 그렇게 천천히 따라 적는 일이다.',
   '사랑', 'public',
   array['demo-seed', '어머니', '글씨'],
   31);

  raise notice '✅ 시연용 글 6편 시드 완료 (A 3편, B 3편).';
end $$;

-- 시드 정리하고 싶을 때:
-- delete from public.user_posts where 'demo-seed' = ANY(tags);
