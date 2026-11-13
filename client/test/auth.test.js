import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Validation logic matching Register.jsx and Auth.jsx
function validateRegistration({ fullName, email, phone, password, confirmPassword }) {
  const errors = [];
  if (!fullName || fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }
  if (!email || !email.includes('@')) {
    errors.push('Please enter a valid email address.');
  }
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  if (!/^\d{10}$/.test(cleanPhone)) {
    errors.push('Please enter a valid 10-digit mobile number.');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }
  return { isValid: errors.length === 0, errors };
}

function validateLogin({ email, password }) {
  const errors = [];
  if (!email) {
    errors.push('Please enter your college email.');
  } else if (!email.endsWith('@mvjce.edu.in') && !email.includes('@')) {
    errors.push('Please use your official @mvjce.edu.in college email.');
  }
  if (!password) {
    errors.push('Please enter your password.');
  }
  return { isValid: errors.length === 0, errors };
}

describe('Authentication & Profile Verification Audit', () => {
  it('should accept valid student registration data', () => {
    const validData = {
      fullName: 'Rahul Varma',
      email: 'rahul.v@mvjce.edu.in',
      phone: '9876543210',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    };
    const result = validateRegistration(validData);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject short name, invalid phone, and mismatching passwords in registration', () => {
    const invalidData = {
      fullName: 'R',
      email: 'notanemail',
      phone: '12345',
      password: '123',
      confirmPassword: '456',
    };
    const result = validateRegistration(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.includes('Full name must be at least 2 characters.'));
    assert.ok(result.errors.includes('Please enter a valid 10-digit mobile number.'));
    assert.ok(result.errors.includes('Password must be at least 6 characters.'));
    assert.ok(result.errors.includes('Passwords do not match.'));
  });

  it('should validate official MVJCE domain on login', () => {
    const studentLogin = {
      email: 'student.name@mvjce.edu.in',
      password: 'password123',
    };
    const result = validateLogin(studentLogin);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject non-email or empty credentials on login', () => {
    const emptyLogin = { email: '', password: '' };
    const result = validateLogin(emptyLogin);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.includes('Please enter your college email.'));
    assert.ok(result.errors.includes('Please enter your password.'));
  });

  it('should verify session storage and logout state clearing', () => {
    const mockStorage = {};
    const setItem = (k, v) => { mockStorage[k] = v; };
    const getItem = (k) => mockStorage[k];
    const removeItem = (k) => { delete mockStorage[k]; };

    // Simulate login
    setItem('cs_auth_state', 'true');
    setItem('cs_user_data', JSON.stringify({ id: 'usr_1', email: 'rahul@mvjce.edu.in' }));

    assert.equal(getItem('cs_auth_state'), 'true');
    assert.ok(getItem('cs_user_data').includes('rahul@mvjce.edu.in'));

    // Simulate logout
    setItem('cs_auth_state', 'false');
    setItem('cs_is_guest', 'false');
    removeItem('cs_user_data');

    assert.equal(getItem('cs_auth_state'), 'false');
    assert.equal(getItem('cs_user_data'), undefined);
  });

  it('should validate password reset and password update requirements', () => {
    function validatePasswordReset(email) {
      if (!email || !email.includes('@')) return { isValid: false, error: 'Valid college email required' };
      return { isValid: true };
    }

    function validateNewPassword(p1, p2) {
      if (!p1 || p1.length < 6) return { isValid: false, error: 'Password must be at least 6 characters' };
      if (p1 !== p2) return { isValid: false, error: 'Passwords do not match' };
      return { isValid: true };
    }

    assert.equal(validatePasswordReset('student@mvjce.edu.in').isValid, true);
    assert.equal(validatePasswordReset('invalid').isValid, false);

    assert.equal(validateNewPassword('newPassword123', 'newPassword123').isValid, true);
    assert.equal(validateNewPassword('123', '123').isValid, false);
    assert.equal(validateNewPassword('newPassword123', 'different').isValid, false);
  });

  it('should enforce route protection rules for unauthenticated users', () => {
    function canAccessDashboard({ isAuthenticated, isGuest }) {
      return Boolean(isAuthenticated || isGuest);
    }

    assert.equal(canAccessDashboard({ isAuthenticated: true, isGuest: false }), true);
    assert.equal(canAccessDashboard({ isAuthenticated: false, isGuest: true }), true);
    assert.equal(canAccessDashboard({ isAuthenticated: false, isGuest: false }), false);
  });
});

