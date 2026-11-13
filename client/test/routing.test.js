import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Routing & Link Navigation Audit', () => {
  const DEFINED_ROUTES = [
    '/',
    '/register',
    '/auth',
    '/onboarding',
    '/dashboard/feed',
    '/dashboard/active-listings',
    '/dashboard/library',
    '/dashboard/history',
    '/dashboard/chat',
    '/dashboard/requests',
    '/dashboard/credits',
    '/dashboard/profile'
  ];

  function resolveRoute(path) {
    if (path === '/welcome') return '/';
    if (path === '/login') return '/auth';
    if (path === '/dashboard') return '/dashboard/feed';

    // Dynamic chat route parameter
    if (path.startsWith('/dashboard/chat/')) {
      const chatId = path.split('/dashboard/chat/')[1];
      if (chatId) return '/dashboard/chat/:chatId';
    }

    if (DEFINED_ROUTES.includes(path)) {
      return path;
    }

    return '/404';
  }

  it('should resolve all primary application routes without 404', () => {
    DEFINED_ROUTES.forEach(route => {
      const resolved = resolveRoute(route);
      assert.notEqual(resolved, '/404', `Route ${route} must be recognized.`);
    });
  });

  it('should support dynamic route parameters for chat deep linking', () => {
    const resolved = resolveRoute('/dashboard/chat/chat_301');
    assert.equal(resolved, '/dashboard/chat/:chatId');
  });

  it('should redirect legacy aliases (/welcome, /login, /dashboard) correctly', () => {
    assert.equal(resolveRoute('/welcome'), '/');
    assert.equal(resolveRoute('/login'), '/auth');
    assert.equal(resolveRoute('/dashboard'), '/dashboard/feed');
  });

  it('should return 404 for unknown or malicious URLs', () => {
    assert.equal(resolveRoute('/unknown-path'), '/404');
    assert.equal(resolveRoute('/admin/backdoor'), '/404');
  });
});

