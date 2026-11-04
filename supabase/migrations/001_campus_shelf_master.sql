-- =========================================================================
-- CAMPUS SHELF: MASTER SYSTEM ARCHITECTURE & SQL MIGRATION SCRIPT
-- Version: 4.0-Production-Grade
-- Target Scope: MVJ College of Engineering (MVJCE)
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Enums
create type public.listing_status as enum ('available', 'reserved', 'completed', 'withdrawn', 'hidden');
create type public.exchange_type as enum ('swap', 'cash');
create type public.request_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'completed', 'expired');
create type public.chat_status as enum ('active', 'completed', 'closed');
create type public.ledger_kind as enum ('credit', 'cash');
create type public.ledger_direction as enum ('in', 'out', 'neutral');

-- 1. Profiles Table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check(char_length(trim(full_name)) between 2 and 80),
  college_email text not null unique,
  mobile_number text unique,
  mobile_verified_at timestamptz,
  branch text not null,
  year smallint not null check(year between 1 and 4),
  semester text,
  campus_zone text not null, -- 'Main Hostel', 'PG near Hosa Road', 'Day Scholar'
  default_handoff text default 'ECE Block Lobby',
  avatar_url text,
  privacy_enabled boolean not null default true,
  credit_balance integer not null default 0 check(credit_balance >= 0),
  role text not null default 'student' check(role in ('student', 'moderator', 'admin')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Public profiles viewable by all" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Public Profile View (Privacy Masking)
create view public.public_profiles with (security_invoker = true) as
select id, full_name, branch, year, avatar_url from public.profiles;

-- 2. Listings Table
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check(char_length(trim(title)) between 1 and 180),
  author text not null,
  subject_code text,
  semester smallint check(semester between 1 and 8),
  category text not null check(category in ('Engineering Textbook', 'General Novel', 'Notes & PYQs')),
  condition text not null check(condition in ('Like New', 'Good / Highlights', 'Worn / Usable')),
  exchange_type public.exchange_type not null,
  price numeric default 0,
  handoff_spot text not null,
  image_url text not null,
  status public.listing_status not null default 'available',
  views int default 0 not null check(views >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.listings enable row level security;
create policy "Available listings viewable by everyone" on public.listings for select using (status = 'available' or user_id = auth.uid());
create policy "Users can insert own listings" on public.listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on public.listings for update using (auth.uid() = user_id);

-- 3. Library Table (Private Catalogue)
create table public.library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  author text not null,
  subject_code text,
  semester smallint check(semester between 1 and 8),
  category text not null,
  image_url text,
  ocr_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.library enable row level security;
create policy "Users manage own library" on public.library for all using (auth.uid() = user_id);

-- 4. Requests Table
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  requester_id uuid not null references public.profiles(id) on delete restrict,
  offer_type text not null, -- 'swap_book', 'swap_credit', 'cash'
  offered_listing_id uuid references public.listings(id) on delete set null,
  offer_amount_inr numeric default 0,
  proposed_handoff text not null default 'ECE Block Lobby',
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  check (owner_id <> requester_id)
);

alter table public.requests enable row level security;
create policy "Users can view own requests" on public.requests for select using (auth.uid() = owner_id or auth.uid() = requester_id);
create policy "Users can insert requests" on public.requests for insert with check (auth.uid() = requester_id);
create policy "Users can update own requests" on public.requests for update using (auth.uid() = owner_id or auth.uid() = requester_id);

-- 5. Chats Table
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete restrict,
  user_one_id uuid not null references public.profiles(id),
  user_two_id uuid not null references public.profiles(id),
  status public.chat_status not null default 'active',
  handoff_spot text not null default 'ECE Block Lobby',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (user_one_id <> user_two_id)
);

alter table public.chats enable row level security;
create policy "Users can view own chats" on public.chats for select using (auth.uid() = user_one_id or auth.uid() = user_two_id);
create policy "Users can create chats" on public.chats for insert with check (auth.uid() = user_one_id or auth.uid() = user_two_id);

-- 6. Messages Table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  content text not null check(char_length(trim(content)) between 1 and 4000),
  message_type text not null default 'text' check(message_type in ('text', 'system')),
  is_read boolean default false not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
create policy "Users can view messages in own chats" on public.messages for select using (
  auth.uid() in (select user_one_id from public.chats where id = chat_id) or
  auth.uid() in (select user_two_id from public.chats where id = chat_id)
);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- 7. Ledgers Table (Immutable Audit Log)
create table public.ledgers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  request_id uuid references public.requests(id) on delete restrict,
  listing_id uuid references public.listings(id) on delete restrict,
  transaction_type text not null, -- 'earn_credit', 'redeem_credit', 'cash_sale', 'cash_purchase'
  kind public.ledger_kind not null default 'credit',
  direction public.ledger_direction not null default 'in',
  amount_change numeric not null,
  description text not null,
  idempotency_key text,
  created_at timestamptz not null default now()
);

alter table public.ledgers enable row level security;
create policy "Users can view own ledger" on public.ledgers for select using (auth.uid() = user_id);

-- Indexes for Speed
create index listings_feed_idx on public.listings(status, created_at desc);
create index listings_owner_idx on public.listings(user_id, status, created_at desc);
create index requests_owner_idx on public.requests(owner_id, status, created_at desc);
create index requests_requester_idx on public.requests(requester_id, status, created_at desc);
create index messages_chat_idx on public.messages(chat_id, created_at asc);
create index ledgers_user_idx on public.ledgers(user_id, created_at desc);

-- =========================================================================
-- ATOMIC RPC FUNCTIONS (Concurreny-Safe)
-- =========================================================================

-- RPC: Accept Request & Atomically Create Chat and Reserve Listing
create or replace function public.accept_request(p_request_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_req record;
  v_chat_id uuid;
begin
  -- Lock request
  select * into v_req from public.requests where id = p_request_id and status = 'pending' for update;
  if not found then
    raise exception 'REQUEST_NOT_PENDING_OR_FOUND';
  end if;

  if v_req.owner_id <> auth.uid() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  -- Lock listing and reserve
  update public.listings set status = 'reserved' where id = v_req.listing_id and status = 'available';
  if not found then
    raise exception 'LISTING_NOT_AVAILABLE';
  end if;

  -- Update request to accepted
  update public.requests set status = 'accepted', accepted_at = now() where id = p_request_id;

  -- Insert chat
  insert into public.chats(request_id, user_one_id, user_two_id, status, handoff_spot)
  values (p_request_id, v_req.owner_id, v_req.requester_id, 'active', v_req.proposed_handoff)
  returning id into v_chat_id;

  -- Insert welcome system message
  insert into public.messages(chat_id, sender_id, content, message_type)
  values (v_chat_id, v_req.owner_id, '📍 Handoff spot confirmed: ' || v_req.proposed_handoff, 'system');

  return v_chat_id;
end;
$$;

