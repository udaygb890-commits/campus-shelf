-- =========================================================================
-- CAMPUS SHELF: STUDENT VERIFICATION & CONFIGURABLE DOMAIN SCHEMA
-- Migration: 003_student_verification.sql
-- =========================================================================

-- 1. Configurable Institutional Domains Table
create table if not exists public.institutional_domain_config (
  id serial primary key,
  domain text not null unique, -- e.g. '@mvjce.edu.in', '@mvjce.onmicrosoft.com'
  institution_name text not null default 'MVJ College of Engineering',
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.institutional_domain_config enable row level security;
create policy "Public can read active institutional domains"
  on public.institutional_domain_config for select
  using (is_active = true);

-- Insert initial configurable domains (Add or edit domains here as confirmed by college IT)
insert into public.institutional_domain_config (domain, institution_name, notes)
values
  ('@mvjce.edu.in', 'MVJCE Primary Institutional Domain', 'Default campus domain'),
  ('@mvjce.onmicrosoft.com', 'MVJCE Microsoft 365 / Outlook Tenant', 'Student Outlook cloud mailboxes'),
  ('@mvjce.ac.in', 'MVJCE Academic Portal Alternate', 'Alternate academic domain')
on conflict (domain) do nothing;

-- 2. Adapt Profiles Table with Verification Fields
do $$
begin
  -- verification_status: pending | email_verification_sent | verified | manual_review | rejected
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'verification_status') then
    alter table public.profiles add column verification_status text not null default 'pending'
      check (verification_status in ('pending', 'email_verification_sent', 'verified', 'manual_review', 'rejected'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'institutional_email') then
    alter table public.profiles add column institutional_email text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'personal_email') then
    alter table public.profiles add column personal_email text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'verification_method') then
    alter table public.profiles add column verification_method text
      check (verification_method in ('outlook_otp', 'email_link', 'admin_manual', 'domain_sso'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'verified_at') then
    alter table public.profiles add column verified_at timestamptz;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'verification_code') then
    alter table public.profiles add column verification_code text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'verification_expires_at') then
    alter table public.profiles add column verification_expires_at timestamptz;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'usn') then
    alter table public.profiles add column usn text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'manual_review_notes') then
    alter table public.profiles add column manual_review_notes text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'student_id_proof_url') then
    alter table public.profiles add column student_id_proof_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'reviewer_id') then
    alter table public.profiles add column reviewer_id uuid references auth.users(id) on delete set null;
  end if;
end;
$$;

-- 3. Server-side Domain Validator Function
create or replace function public.is_valid_institutional_domain(p_email text)
returns boolean language plpgsql security definer as $$
declare
  v_domain text;
begin
  if p_email is null or position('@' in p_email) = 0 then
    return false;
  end if;

  v_domain := '@' || split_part(lower(trim(p_email)), '@', 2);

  return exists (
    select 1 from public.institutional_domain_config
    where domain = v_domain and is_active = true
  );
end;
$$;

-- 4. Server-Side RPC: Request Institutional Verification Code
create or replace function public.request_institutional_verification(
  p_institutional_email text,
  p_code text,
  p_expires_at timestamptz
)
returns json language plpgsql security definer as $$
declare
  v_uid uuid;
  v_is_valid boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return json_build_object('success', false, 'error', 'UNAUTHORIZED');
  end if;

  -- Server-side domain validation
  v_is_valid := public.is_valid_institutional_domain(p_institutional_email);
  if not v_is_valid then
    return json_build_object(
      'success', false, 
      'error', 'INVALID_INSTITUTIONAL_DOMAIN',
      'message', 'The provided email domain is not currently authorized for MVJCE student verification.'
    );
  end if;

  -- Prevent duplicate verified usage of institutional email across accounts
  if exists (
    select 1 from public.profiles 
    where lower(institutional_email) = lower(trim(p_institutional_email))
      and id <> v_uid 
      and verification_status = 'verified'
  ) then
    return json_build_object(
      'success', false,
      'error', 'EMAIL_ALREADY_VERIFIED_BY_OTHER_USER',
      'message', 'This institutional email is already verified on another account.'
    );
  end if;

  -- Store verification request
  update public.profiles
  set 
    institutional_email = lower(trim(p_institutional_email)),
    verification_status = 'email_verification_sent',
    verification_code = p_code,
    verification_expires_at = p_expires_at,
    verification_method = 'outlook_otp',
    updated_at = now()
  where id = v_uid;

  return json_build_object('success', true);
end;
$$;

-- 5. Server-Side RPC: Confirm Verification Code
create or replace function public.verify_institutional_code(p_code text)
returns json language plpgsql security definer as $$
declare
  v_uid uuid;
  v_profile record;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return json_build_object('success', false, 'error', 'UNAUTHORIZED');
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found then
    return json_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
  end if;

  if v_profile.verification_status = 'verified' then
    return json_build_object('success', true, 'message', 'ALREADY_VERIFIED');
  end if;

  if v_profile.verification_code is null or v_profile.verification_code <> trim(p_code) then
    return json_build_object('success', false, 'error', 'INVALID_CODE', 'message', 'Invalid verification code.');
  end if;

  if v_profile.verification_expires_at is not null and now() > v_profile.verification_expires_at then
    return json_build_object('success', false, 'error', 'EXPIRED_CODE', 'message', 'Verification code has expired. Please request a new code.');
  end if;

  -- Mark profile as verified and award welcome token if initial
  update public.profiles
  set
    verification_status = 'verified',
    verified_at = now(),
    verification_code = null,
    credit_balance = case when credit_balance = 0 then 1 else credit_balance end,
    updated_at = now()
  where id = v_uid;

  return json_build_object('success', true);
end;
$$;

-- 6. Server-Side RPC: Request Admin Manual Review
create or replace function public.request_manual_student_review(
  p_institutional_email text,
  p_usn text,
  p_notes text,
  p_id_proof_url text default null
)
returns json language plpgsql security definer as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return json_build_object('success', false, 'error', 'UNAUTHORIZED');
  end if;

  update public.profiles
  set
    institutional_email = lower(trim(p_institutional_email)),
    usn = upper(trim(p_usn)),
    manual_review_notes = p_notes,
    student_id_proof_url = p_id_proof_url,
    verification_status = 'manual_review',
    verification_method = 'admin_manual',
    updated_at = now()
  where id = v_uid;

  return json_build_object('success', true);
end;
$$;

-- 7. Updated Auth Hook: Handle Google and Email Signups
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_is_inst_domain boolean;
begin
  -- Check if login email itself belongs to an authorized institutional domain
  v_is_inst_domain := public.is_valid_institutional_domain(new.email);

  insert into public.profiles (
    id,
    full_name,
    college_email,
    personal_email,
    institutional_email,
    branch,
    year,
    campus_zone,
    default_handoff,
    credit_balance,
    verification_status,
    verification_method,
    verified_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.email,
    case when v_is_inst_domain then new.email else null end,
    coalesce(new.raw_user_meta_data->>'branch', 'First Year Basic Sciences'),
    coalesce((new.raw_user_meta_data->>'year')::smallint, 1),
    coalesce(new.raw_user_meta_data->>'campus_zone', 'Day Scholar'),
    coalesce(new.raw_user_meta_data->>'default_handoff', 'ECE Block Lobby'),
    case when v_is_inst_domain then 1 else 0 end,
    case when v_is_inst_domain then 'verified' else 'pending' end,
    case when v_is_inst_domain then 'domain_sso' else null end,
    case when v_is_inst_domain then now() else null end
  )
  on conflict (id) do update set
    personal_email = coalesce(excluded.personal_email, public.profiles.personal_email),
    updated_at = now();

  return new;
end;
$$;
