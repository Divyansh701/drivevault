import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormField, Alert } from '@/components/ui';
import { useAuth } from '@/context';
import { authService } from '@/services';
import type { ApiError } from '@/types';

// ─── Validation ───────────────────────────────────────────────────────────────

interface RegisterFields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(fields: RegisterFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!fields.password) {
    errors.password = 'Password is required.';
  } else if (fields.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = 'Password must contain at least one uppercase letter.';
  } else if (!/[0-9]/.test(fields.password)) {
    errors.password = 'Password must contain at least one number.';
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

// ─── Password strength meter ──────────────────────────────────────────────────

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair',   color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good',   color: 'bg-yellow-400' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500' };
  return { score, label: 'Very Strong', color: 'bg-brand-500' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  const segments = 5;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : 'bg-surface-700'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium transition-colors ${color.replace('bg-', 'text-')}`}>
        {label}
      </p>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();

  // We bypass useAuth.login here because register returns its own AuthResponse
  const { login } = useAuth();

  const [fields, setFields]     = useState<RegisterFields>({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Field change ────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setApiError(null);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(fields);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      // Register and store token
      await authService.register({
        name: fields.name.trim(),
        email: fields.email.trim(),
        password: fields.password,
      });
      // Then fetch profile via context login
      await login(fields.email.trim(), fields.password);
      navigate('/vehicles', { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      <div style={{
        background: 'rgba(8,12,24,0.75)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(201,168,76,0.18)',
        padding: '40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)',
          padding: '6px 14px', marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C',
            boxShadow: '0 0 8px #C9A84C' }} />
          <span style={{ color: '#C9A84C', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>
            New Member
          </span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 26, fontWeight: 600, color: '#fff', margin: '0 0 6px', letterSpacing: 0.3 }}>
            Create your account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
            Join DIVI and access the world's finest automotive collection.
          </p>
        </div>

        {/* API error */}
        {apiError && (
          <div className="mb-6">
            <Alert type="error" onDismiss={() => setApiError(null)}>
              {apiError}
            </Alert>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField id="register-name" name="name" label="Full name" type="text"
            placeholder="Your full name" autoComplete="name"
            value={fields.name} onChange={handleChange} error={errors.name}
            leftIcon={<UserIcon />} required />

          <FormField id="register-email" name="email" label="Email address" type="email"
            placeholder="you@example.com" autoComplete="email"
            value={fields.email} onChange={handleChange} error={errors.email}
            leftIcon={<EmailIcon />} required />

          <div>
            <FormField id="register-password" name="password" label="Password"
              type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
              autoComplete="new-password" value={fields.password} onChange={handleChange}
              error={errors.password}
              hint={!errors.password ? 'Use 8+ characters with uppercase and numbers.' : undefined}
              leftIcon={<LockIcon />}
              rightElement={
                <button type="button" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide' : 'Show'}
                  className="text-surface-500 hover:text-surface-300 transition-colors">
                  <EyeIcon open={showPw} />
                </button>
              } required />
            <PasswordStrengthBar password={fields.password} />
          </div>

          <FormField id="register-confirm-password" name="confirmPassword" label="Confirm password"
            type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
            autoComplete="new-password" value={fields.confirmPassword} onChange={handleChange}
            error={errors.confirmPassword} leftIcon={<ShieldIcon />}
            rightElement={
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide' : 'Show'}
                className="text-surface-500 hover:text-surface-300 transition-colors">
                <EyeIcon open={showConfirm} />
              </button>
            } required />

          {/* Submit */}
          <button type="submit" disabled={isLoading} style={{
            width: '100%', padding: '15px 0', border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            background: isLoading ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #C9A84C, #E2C97E)',
            color: '#020617', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
            fontWeight: 700, fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
            boxShadow: '0 0 24px rgba(201,168,76,0.25)', opacity: isLoading ? 0.7 : 1,
            marginTop: 8,
          }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.boxShadow = '0 0 40px rgba(201,168,76,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.25)'; }}>
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
            Already a member?
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <Link to="/login" style={{
          display: 'block', textAlign: 'center', padding: '13px 0', textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)',
          fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500,
          transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.color = '#C9A84C'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
          Sign In Instead
        </Link>
      </div>
    </AuthLayout>
  );
}
