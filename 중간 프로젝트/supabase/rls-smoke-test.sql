-- ============================================================
-- 글결 — RLS 침투 테스트 (TRD R-03 / Phase 1 Exit Criterion)
--
-- 사전 준비:
--   1. /signup 에서 두 개의 테스트 계정 생성 (A, B)
--   2. 이 스크립트를 Supabase SQL Editor에 붙여넣고 Run
--   3. 결과 테이블의 result 컬럼이 모두 'PASS' 여야 통과
-- ============================================================

create or replace function public._rls_smoke_test()
returns table(test_no int, test_name text, result text, detail text)
language plpgsql
as $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_post_id uuid;
  v_count int;
begin
  -- 가장 최근 가입한 두 사용자
  select id into v_user_a from auth.users order by created_at desc offset 0 limit 1;
  select id into v_user_b from auth.users order by created_at desc offset 1 limit 1;

  if v_user_a is null or v_user_b is null then
    return query select 0,
      '사전조건'::text,
      'FAIL'::text,
      'auth.users에 두 명 이상 필요. /signup 에서 두 계정 만들고 다시 실행.'::text;
    return;
  end if;

  -- A 명의의 private 글 1개 INSERT (서비스 롤로)
  insert into public.user_posts (user_id, title, body, category, visibility)
  values (v_user_a, '비밀 글 (RLS 테스트)', '이 글은 A만 보여야 합니다.', '고요', 'private')
  returning id into v_post_id;

  return query select 0,
    '준비'::text, 'INFO'::text,
    format('A=%s, B=%s, post=%s', v_user_a, v_user_b, v_post_id);

  -- B의 시각으로 전환
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_user_b::text, 'role', 'authenticated')::text,
    true
  );

  -- Test 1
  select count(*) into v_count
    from public.user_posts where id = v_post_id;
  return query select 1,
    'B는 A의 private user_posts를 SELECT 불가'::text,
    case when v_count = 0 then 'PASS' else 'FAIL' end,
    format('rows=%s (기대값=0)', v_count);

  -- Test 2
  select count(*) into v_count
    from public.saved_items where user_id = v_user_a;
  return query select 2,
    'B는 A의 saved_items를 SELECT 불가'::text,
    case when v_count = 0 then 'PASS' else 'FAIL' end,
    format('rows=%s (기대값=0)', v_count);

  -- Test 3 — A 명의 INSERT 위장 시도
  declare
    v_inserted boolean := false;
    v_err text := '';
  begin
    begin
      insert into public.user_posts (user_id, title, body, category, visibility)
      values (v_user_a, '위장 글', '본문', '고요', 'private');
      v_inserted := true;
    exception when others then
      v_err := sqlerrm;
    end;
    return query select 3,
      'B의 A 명의 user_posts INSERT 차단'::text,
      case when v_inserted then 'FAIL' else 'PASS' end,
      case when v_inserted then '위장 INSERT 성공함' else v_err end;
  end;

  -- Test 4
  select count(*) into v_count
    from public.payment_logs where user_id = v_user_a;
  return query select 4,
    'B는 A의 payment_logs를 SELECT 불가'::text,
    case when v_count = 0 then 'PASS' else 'FAIL' end,
    format('rows=%s (기대값=0)', v_count);

  -- 정리
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
  delete from public.user_posts where id = v_post_id;

  return;
end;
$$;

-- 실행
select * from public._rls_smoke_test() order by test_no;

-- 함수 정리
drop function public._rls_smoke_test();
