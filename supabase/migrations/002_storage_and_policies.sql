-- =========================================================================
-- CAMPUS SHELF: STORAGE BUCKETS, SAFETY TRIGGERS & RLS REPAIR MIGRATION
-- Migration: 002_storage_and_policies.sql
-- =========================================================================

-- 1. Storage Buckets for Book Covers and User Avatars
insert into storage.buckets (id, name, public)
values 
  ('book-covers', 'book-covers', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage RLS Policies
create policy "Public can read book covers"
on storage.objects for select
using (bucket_id = 'book-covers');

create policy "Authenticated users can upload book covers"
on storage.objects for insert
with check (
  bucket_id = 'book-covers' and 
  auth.role() = 'authenticated'
);

create policy "Public can read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars' and 
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Concurrency Safety: Prevent Duplicate Pending Requests for the same listing
create unique index if not exists unique_pending_request_idx 
on public.requests (listing_id, requester_id) 
where status = 'pending';

-- 3. Automatic Profile Creation on Supabase Auth Signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (
    id,
    full_name,
    college_email,
    branch,
    year,
    campus_zone,
    default_handoff,
    credit_balance
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'branch', 'First Year Basic Sciences'),
    coalesce((new.raw_user_meta_data->>'year')::smallint, 1),
    coalesce(new.raw_user_meta_data->>'campus_zone', 'Day Scholar'),
    coalesce(new.raw_user_meta_data->>'default_handoff', 'ECE Block Lobby'),
    1 -- Welcome reward token
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Message Authorization Repair
-- Ensure both participants of a chat can send messages, and system bot messages can be recorded
create or replace policy "Participants can send messages"
on public.messages for insert
with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.chats c
    where c.id = chat_id
      and (c.user_one_id = auth.uid() or c.user_two_id = auth.uid())
  )
);

