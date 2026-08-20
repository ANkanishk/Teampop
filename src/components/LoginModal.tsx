import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Gamepad2, 
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Smartphone,
  Eye,
  EyeOff,
  Gift,
  Sparkles
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { HowToPlayVideoGuide } from './HowToPlayVideoGuide';

interface LoginModalProps {
  onClose: () => void;
  onAdminAuthenticated?: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onAdminAuthenticated,
  initialMode = 'LOGIN',
}) => {
  const { loginWithEmail, loginWithPhoneOtp, registerWithEmail, resetPassword, language, t } = useTournaments();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT' | 'PHONE_OTP'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regInGameName, setRegInGameName] = useState('');
  const [regGameUid, setRegGameUid] = useState('');
  const [regReferralCode, setRegReferralCode] = useState(() => {
    try {
      return localStorage.getItem('pop_referral_code') || '';
    } catch {
      return '';
    }
  });
  const [referralValidation, setReferralValidation] = useState<{ valid?: boolean; referrerName?: string; loading?: boolean } | null>(null);

  // Check referral code validity on change
  useEffect(() => {
    const clean = regReferralCode.trim();
    if (!clean) {
      setReferralValidation(null);
      return;
    }

    const timer = setTimeout(async () => {
      setReferralValidation({ loading: true });
      try {
        const res = await fetch(`/api/referrals/check-code?code=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.valid) {
          setReferralValidation({ valid: true, referrerName: data.referrerName });
        } else {
          setReferralValidation({ valid: false });
        }
      } catch {
        setReferralValidation(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [regReferralCode]);

  // Forgot password & OTP state
  const [forgotTarget, setForgotTarget] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Phone quick OTP login state
  const [phoneLoginNumber, setPhoneLoginNumber] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneLoginOtp, setPhoneLoginOtp] = useState('');

  // 1. Password Login (Email or Phone)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await loginWithEmail(loginIdentifier, loginPassword);
      if (res.success) {
        if (res.isAdmin && onAdminAuthenticated) {
          onAdminAuthenticated();
        }
        onClose();
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Direct Register with Email & Phone & Password
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() && !regPhone.trim()) {
      setError('Please enter either a valid Email or 10-digit Phone number.');
      return;
    }
    if (regPassword.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await registerWithEmail({
        email: regEmail.trim(),
        password: regPassword.trim(),
        name: regName.trim(),
        phone: regPhone.trim(),
        inGameName: regInGameName.trim(),
        gameUid: regGameUid.trim(),
        referredBy: regReferralCode.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg('🎉 Account registered successfully! Your password is saved permanently. Welcome to POP Gaming.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Could not create account.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration error.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Send Real OTP for Password Recovery (via Server API)
  const handleSendRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotTarget.trim()) {
      setError('Please enter your registered Email or Mobile Number.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setOtpSent(true);

    try {
      const isEmail = forgotTarget.includes('@');
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: forgotTarget.trim(),
          type: isEmail ? 'EMAIL' : 'PHONE',
          purpose: 'FORGOT_PASSWORD',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMsg(
          isEmail 
            ? `Verification code sent to ${forgotTarget}. Please check your Inbox and Spam folder.`
            : `Verification code sent to mobile +91 ${forgotTarget}. Enter code below.`
        );
      } else {
        setError(data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err: any) {
      setError('Network error. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify OTP and Set New Password (Strict OTP Verification Required)
  const handleVerifyOtpAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEnteredOtp.trim() || userEnteredOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify OTP with server - strictly enforced
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: forgotTarget.trim(),
          otp: userEnteredOtp.trim(),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setError(verifyData.error || 'Invalid or expired verification code. Please check your email or request a new code.');
        setLoading(false);
        return;
      }

      // 2. Reset password in database
      const res = await resetPassword(forgotTarget.trim(), newPassword.trim());
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset successfully! Redirecting to Sign In...');
        setTimeout(() => {
          setMode('LOGIN');
          setLoginIdentifier(forgotTarget.trim());
          setLoginPassword(newPassword.trim());
          setSuccessMsg(null);
          setOtpSent(false);
          setUserEnteredOtp('');
          setNewPassword('');
        }, 1200);
      } else {
        setError(res.error || 'Password reset failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Phone Quick OTP: Send OTP
  const handleSendPhoneLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneLoginNumber.trim().replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanNumber,
          type: 'PHONE',
          purpose: 'PHONE_LOGIN',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPhoneOtpSent(true);
        setSuccessMsg(`Verification code sent to +91 ${cleanNumber}. Enter code to verify.`);
      } else {
        setError(data.error || 'Failed to send verification code.');
      }
    } catch (err) {
      setError('Network error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Phone Quick OTP: Verify & Sign In / Register
  const handleVerifyPhoneLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneLoginNumber.trim().replace(/\D/g, '');
    if (!phoneLoginOtp.trim() || phoneLoginOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanNumber,
          otp: phoneLoginOtp.trim(),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setError(verifyData.error || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      // Check if user exists or log in / create phone account
      const res = await loginWithPhoneOtp(cleanNumber);

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Phone login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="modal-login" 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-10">
        <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 space-y-4 sm:space-y-5 my-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  {mode === 'LOGIN' 
                    ? 'Player Sign In' 
                    : mode === 'REGISTER' 
                    ? 'Create Player Account' 
                    : mode === 'PHONE_OTP'
                    ? 'Mobile Number OTP Login'
                    : 'Account Recovery (OTP)'}
                </h2>
                <p className="text-xs text-neutral-400">
                  {mode === 'LOGIN' 
                    ? 'Access your tournaments, wallet & passes' 
                    : mode === 'REGISTER' 
                    ? 'Sign up with email & phone' 
                    : mode === 'PHONE_OTP'
                    ? 'Fast password-free verification'
                    : 'Reset password via real email / phone OTP'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs (For Login & Register) */}
          {(mode === 'LOGIN' || mode === 'REGISTER') && (
            <div className="grid grid-cols-2 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'LOGIN'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t.signIn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'REGISTER'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t.register}
              </button>
            </div>
          )}

          {/* Quick Video Tutorial Guide */}
          <HowToPlayVideoGuide variant="compact" videoType="login" />

          {/* Status Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    placeholder="name@gmail.com or 10-digit mobile"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    onBlur={(e) => {
                      let val = e.target.value.trim();
                      if (val.includes('@')) {
                        val = val.toLowerCase().replace(/@gmail\.co$/i, '@gmail.com').replace(/@gmail\.con$/i, '@gmail.com');
                        setLoginIdentifier(val);
                      }
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT');
                      setForgotTarget(loginIdentifier);
                      setError(null);
                      setSuccessMsg(null);
                      setOtpSent(false);
                    }}
                    className="text-[11px] text-orange-400 hover:text-orange-300 transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Sign In</span>
              </button>

              <div className="pt-2 border-t border-neutral-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('PHONE_OTP');
                    setError(null);
                    setSuccessMsg(null);
                    setPhoneOtpSent(false);
                  }}
                  className="text-xs text-neutral-400 hover:text-orange-400 font-semibold transition cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                  <span>Sign In using Mobile Number + OTP instead</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. DIRECT REGISTER FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Free Fire In-Game Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ⚡RAISTAR⚡"
                    value={regInGameName}
                    onChange={(e) => setRegInGameName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Free Fire UID</label>
                  <input
                    type="text"
                    placeholder="e.g. 2849182391"
                    value={regGameUid}
                    onChange={(e) => setRegGameUid(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="email"
                    required
                    placeholder="player@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    onBlur={(e) => {
                      let val = e.target.value.trim().toLowerCase();
                      val = val.replace(/@gmail\.co$/i, '@gmail.com').replace(/@gmail\.con$/i, '@gmail.com').replace(/@gmail\.comm$/i, '@gmail.com').replace(/@gmail\.cmo$/i, '@gmail.com');
                      setRegEmail(val);
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Set Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 4 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-8 pr-10 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Your password is saved securely and stays safe permanently.</span>
                </p>
              </div>

              {/* Referral / Reference Code (Optional) */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-950/30 to-amber-950/20 border border-orange-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-orange-300 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-orange-400" />
                    <span>Referral / Reference Code (Optional)</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    +₹20 Signup Bonus
                  </span>
                </div>

                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
                  <input
                    type="text"
                    placeholder="Enter friend's referral code (e.g. POP1234)"
                    value={regReferralCode}
                    onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-orange-500/30 rounded-xl text-xs text-orange-200 placeholder-neutral-600 focus:outline-none focus:border-orange-400 uppercase font-mono font-bold"
                  />
                </div>

                {referralValidation && (
                  <div className="text-[11px]">
                    {referralValidation.loading ? (
                      <span className="text-neutral-400 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Verifying reference code...
                      </span>
                    ) : referralValidation.valid ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Code Applied! Invited by {referralValidation.referrerName}
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[10px]">
                        ℹ️ Code not recognized, but you still get ₹20 Welcome Bonus!
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition disabled:opacity-50 mt-1"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Create Account & Get ₹20 Bonus</span>
              </button>
            </form>
          )}

          {/* 3. PHONE NUMBER OTP LOGIN */}
          {mode === 'PHONE_OTP' && (
            <div className="space-y-3.5">
              {!phoneOtpSent ? (
                <form onSubmit={handleSendPhoneLoginOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phoneLoginNumber}
                        onChange={(e) => setPhoneLoginNumber(e.target.value)}
                        className="w-full pl-12 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                    <span>Send Verification Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneLoginOtp} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-neutral-300">
                        Enter 6-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setPhoneOtpSent(false)}
                        className="text-[11px] text-orange-400 hover:underline cursor-pointer"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={phoneLoginOtp}
                      onChange={(e) => setPhoneLoginOtp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center font-mono tracking-widest text-base text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Verify & Sign In</span>
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-neutral-400 hover:text-white transition cursor-pointer pt-1"
              >
                ← Back to Password Sign In
              </button>
            </div>
          )}

          {/* 4. SECURITY VERIFICATION & PASSWORD RESET */}
          {mode === 'FORGOT' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendRecoveryOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Enter Your Registered Email or Phone
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        required
                        placeholder="name@gmail.com or 10-digit mobile"
                        value={forgotTarget}
                        onChange={(e) => setForgotTarget(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1.5">
                      A 6-digit verification code will be sent to your registered email / mobile number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    <span>Send Verification Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndResetPassword} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-neutral-300">
                        Enter 6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-orange-400 hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={userEnteredOtp}
                      onChange={(e) => setUserEnteredOtp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center font-mono tracking-widest text-base text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Set New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="password"
                        required
                        placeholder="Enter new password (min 4 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Verify Code & Update Password</span>
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                  setOtpSent(false);
                }}
                className="w-full text-center text-xs text-neutral-400 hover:text-white transition cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
