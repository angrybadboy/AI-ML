-- ============================================================
-- 글결 — Phase 1 초기 마이그레이션
-- 기준: TRD §3.1, §3.3 + CLAUDE.md §1.4 (serial_no, category 추가)
-- ============================================================

-- ===== Extensions =====
create extension if not exists "pgcrypto";

-- ===== Enums-as-checks helper: category =====
-- 별도 enum 타입 대신 CHECK 제약을 사용 (마이그레이션 유연성).
--   '고요' | '위로' | '사랑' | '용기' | '그리움' | '사색'

-- ===== Tables =====

-- profiles: auth.users 1:1 확장
create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  nickname                 text not null check (char_length(nickname) between 1 and 20),
  created_at               timestamptz not null default now(),
  subscription_status      text not null default 'free'
                           check (subscription_status in ('free','premium')),
  subscription_expires_at  timestamptz
);

-- daily_quotes: 시스템/AI가 제공하는 오늘의 글귀
create table public.daily_quotes (
  id           uuid primary key default gen_random_uuid(),
  serial_no    int generated always as identity unique not null,
  date         date unique not null,
  title        text not null check (char_length(title) between 1 and 60),
  body         text not null,
  category     text not null
               check (category in ('고요','위로','사랑','용기','그리움','사색')),
  source_type  text not null check (source_type in ('ai','curated')),
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create index daily_quotes_date_idx on public.daily_quotes (date desc);
create index daily_quotes_serial_idx on public.daily_quotes (serial_no desc);

-- user_posts: 사용자가 작성한 글귀
create table public.user_posts (
  id          uuid primary key default gen_random_uuid(),
  serial_no   int generated always as identity unique not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 40),
  body        text not null check (char_length(body) between 1 and 600),
  category    text not null
              check (category in ('고요','위로','사랑','용기','그리움','사색')),
  visibility  text not null default 'private'
              check (visibility in ('public','private')),
  tags        text[] not null default '{}',
  like_count  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index user_posts_user_idx on public.user_posts (user_id, created_at desc);
create index user_posts_public_idx
  on public.user_posts (created_at desc)
  where visibility = 'public';

-- saved_items: 저장한 글 (daily_quotes 또는 user_posts)
create table public.saved_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_type  text not null check (item_type in ('daily','user')),
  item_id    uuid not null,
  saved_at   timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index saved_items_user_idx on public.saved_items (user_id, saved_at desc);

-- saved_items의 item_id 무결성 — trigger로 검증
create or replace function public.check_saved_item_ref()
returns trigger language plpgsql as $$
begin
  if new.item_type = 'daily' then
    if not exists (select 1 from public.daily_quotes where id = new.item_id) then
      raise exception 'invalid daily_quote id: %', new.item_id;
    end if;
  elsif new.item_type = 'user' then
    if not exists (select 1 from public.user_posts where id = new.item_id) then
      raise exception 'invalid user_post id: %', new.item_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger saved_items_ref_check
  before insert or update on public.saved_items
  for each row execute function public.check_saved_item_ref();

-- post_likes (P1)
create table public.post_likes (
  user_id     uuid not null references auth.users(id) on delete cascade,
  post_id     uuid not null references public.user_posts(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index post_likes_post_idx on public.post_likes (post_id);

-- payment_logs
create table public.payment_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id),
  order_id      text unique not null,
  payment_key   text,
  amount        int not null check (amount > 0),
  status        text not null check (status in ('ready','approved','failed','canceled')),
  raw_response  jsonb,
  created_at    timestamptz not null default now()
);

create index payment_logs_user_idx on public.payment_logs (user_id, created_at desc);
create index payment_logs_order_idx on public.payment_logs (order_id);

-- ===== updated_at 자동 갱신 trigger =====
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_posts_touch_updated_at
  before update on public.user_posts
  for each row execute function public.touch_updated_at();

-- ===== profiles 자동 생성 (auth.users INSERT 시) =====
-- signup 시 nickname을 auth metadata에 담아 보내면 그대로 적용.
-- 누락 시 이메일 local-part로 폴백.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta_nickname text;
  fallback_nickname text;
begin
  meta_nickname := nullif(trim(coalesce(new.raw_user_meta_data->>'nickname', '')), '');
  fallback_nickname := coalesce(meta_nickname, split_part(new.email, '@', 1));
  -- 길이 보정
  fallback_nickname := substr(fallback_nickname, 1, 20);
  insert into public.profiles (id, nickname)
  values (new.id, fallback_nickname)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (TRD §3.3)
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.daily_quotes  enable row level security;
alter table public.user_posts    enable row level security;
alter table public.saved_items   enable row level security;
alter table public.post_likes    enable row level security;
alter table public.payment_logs  enable row level security;

-- ----- profiles -----
create policy profiles_select_self_or_public
  on public.profiles for select to authenticated
  using (true);  -- 닉네임은 공개 정보 (피드 작성자 표시용). 민감 컬럼은 향후 view로 제한.

create policy profiles_insert_self
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_self
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ----- daily_quotes -----
create policy daily_quotes_select_authenticated
  on public.daily_quotes for select to authenticated
  using (true);
-- INSERT/UPDATE/DELETE는 service role만 (RLS bypass).

-- ----- user_posts -----
create policy user_posts_select_public_or_own
  on public.user_posts for select to authenticated
  using (visibility = 'public' or user_id = auth.uid());

create policy user_posts_insert_own
  on public.user_posts for insert to authenticated
  with check (user_id = auth.uid());

create policy user_posts_update_own
  on public.user_posts for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy user_posts_delete_own
  on public.user_posts for delete to authenticated
  using (user_id = auth.uid());

-- ----- saved_items -----
create policy saved_items_select_own
  on public.saved_items for select to authenticated
  using (user_id = auth.uid());

create policy saved_items_insert_own
  on public.saved_items for insert to authenticated
  with check (user_id = auth.uid());

create policy saved_items_delete_own
  on public.saved_items for delete to authenticated
  using (user_id = auth.uid());

-- ----- post_likes (P1) -----
create policy post_likes_select_own
  on public.post_likes for select to authenticated
  using (user_id = auth.uid());

create policy post_likes_insert_own
  on public.post_likes for insert to authenticated
  with check (user_id = auth.uid());

create policy post_likes_delete_own
  on public.post_likes for delete to authenticated
  using (user_id = auth.uid());

-- ----- payment_logs -----
create policy payment_logs_select_own
  on public.payment_logs for select to authenticated
  using (user_id = auth.uid());
-- INSERT/UPDATE는 service role 경유 (TRD §6.4 amount 재검증).
