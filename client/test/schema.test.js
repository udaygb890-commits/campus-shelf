import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Supabase Database Schema & RLS Audit', () => {
  const migration001Path = path.resolve('../supabase/migrations/001_campus_shelf_master.sql');
  const migration002Path = path.resolve('../supabase/migrations/002_storage_and_policies.sql');

  it('should verify migration 001 exists and contains all required core tables', () => {
    assert.ok(fs.existsSync(migration001Path), '001_campus_shelf_master.sql must exist');
    const sql = fs.readFileSync(migration001Path, 'utf8');

    const expectedTables = [
      'public.profiles',
      'public.listings',
      'public.library',
      'public.requests',
      'public.chats',
      'public.messages',
      'public.ledgers'
    ];

    expectedTables.forEach(tbl => {
      assert.ok(sql.includes(`create table ${tbl}`), `Migration must create ${tbl}`);
    });

    // Check RLS enabled on all tables
    expectedTables.forEach(tbl => {
      assert.ok(sql.includes(`alter table ${tbl} enable row level security;`), `RLS must be enabled on ${tbl}`);
    });

    // Check atomic RPC accept_request
    assert.ok(sql.includes('create or replace function public.accept_request'), 'accept_request RPC must be defined');
  });

  it('should verify migration 002 exists with storage buckets, concurrency constraints, and safety triggers', () => {
    assert.ok(fs.existsSync(migration002Path), '002_storage_and_policies.sql must exist');
    const sql = fs.readFileSync(migration002Path, 'utf8');

    assert.ok(sql.includes('book-covers'), 'book-covers bucket must be configured');
    assert.ok(sql.includes('avatars'), 'avatars bucket must be configured');
    assert.ok(sql.includes('unique_pending_request_idx'), 'concurrency unique index on requests must exist');
    assert.ok(sql.includes('handle_new_user'), 'auto-profile creation trigger must be defined');
    assert.ok(sql.includes('Participants can send messages'), 'repaired message RLS policy must be defined');
  });
});
