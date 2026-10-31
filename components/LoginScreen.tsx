import React, { useState } from 'react';

interface LoginScreenProps { onLogin: (username: string) => void; lang: 'en' | 'ar'; }
interface UserAccount { username: string; password: string; email: string; createdAt: number; }

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getUsers = (): UserAccount[] => { const u = localStorage.getItem('masri-users'); return u ? JSON.parse(u) : []; };
  const saveUsers = (users: UserAccount[]) => { localStorage.setItem('masri-users', JSON.stringify(users)); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!username.trim() || !password.trim()) { setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    if (username === 'admin' && password === 'W@el_2010') { localStorage.setItem('masri-current-user', JSON.stringify({ username: 'admin', role: 'admin', createdAt: Date.now() })); onLogin('admin'); return; }
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (found) { localStorage.setItem('masri-current-user', JSON.stringify({ username: found.username, role: 'user', createdAt: found.createdAt })); onLogin(found.username); }
    else { setError(lang === 'ar' ? 'بيانات غير صحيحة' : 'Invalid credentials'); }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!username.trim() || !password.trim() || !email.trim()) { setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    if (password !== confirmPassword) { setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'); return; }
    if (password.length < 6) { setError(lang === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'); return; }
    if (username === 'admin') { setError(lang === 'ar' ? 'اسم محجوز' : 'Reserved'); return; }
    const users = getUsers();
    if (users.find(u => u.username === username)) { setError(lang === 'ar' ? 'مستخدم بالفعل' : 'Already exists'); return; }
    users.push({ username, password, email, createdAt: Date.now() });
    saveUsers(users);
    setSuccess(lang === 'ar' ? 'تم إنشاء الحساب!' : 'Account created!');
    setIsLogin(true); setPassword(''); setConfirmPassword(''); setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl icon-3d-cyan icon-3d mb-4 mx-auto animate-float">
            <i className="fas fa-microphone text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">{lang === 'ar' ? 'ستوديو مصر' : 'MASRI Studio'}</h1>
          <p className="text-txt-muted text-sm mt-1">{lang === 'ar' ? 'توليد صوتي بالذكاء الاصطناعي' : 'AI Voice Generation'}</p>
        </div>

        <div className="card p-6">
          <div className="flex bg-surface2 rounded-xl p-1 mb-6">
            <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-accent text-white shadow-lg' : 'text-txt-muted'}`}>{lang === 'ar' ? 'دخول' : 'Login'}</button>
            <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-accent text-white shadow-lg' : 'text-txt-muted'}`}>{lang === 'ar' ? 'حساب جديد' : 'Register'}</button>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"><i className="fas fa-exclamation-circle ml-2"></i>{error}</div>}
          {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs"><i className="fas fa-check-circle ml-2"></i>{success}</div>}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative"><div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-user"></i></div><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'} className="input w-full px-4 py-3 pr-10 text-sm" /></div>
              <div className="relative"><div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-lock"></i></div><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'} className="input w-full px-4 py-3 pr-10 pl-10 text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-accent"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i></button></div>
              <button type="submit" className="btn-primary w-full py-3.5 text-sm"><i className="fas fa-arrow-right-to-bracket ml-2"></i>{lang === 'ar' ? 'دخول' : 'Sign In'}</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="relative"><div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-user"></i></div><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'} className="input w-full px-4 py-3 pr-10 text-sm" /></div>
              <div className="relative"><div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-envelope"></i></div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={lang === 'ar' ? 'البريد' : 'Email'} className="input w-full px-4 py-3 pr-10 text-sm" /></div>
              <div className="relative"><div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-lock"></i></div><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'} className="input w-full px-4 py-3 pr-10 text-sm" /></div>
              <div className="relative"><div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-lock"></i></div><input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm'} className="input w-full px-4 py-3 pr-10 text-sm" /></div>
              <button type="submit" className="btn-primary w-full py-3.5 text-sm"><i className="fas fa-user-plus ml-2"></i>{lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}</button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-border text-center"><p className="text-txt-muted text-xs">{lang === 'ar' ? 'مسؤول؟ ' : 'Admin? '}<span className="text-accent font-semibold">Admin Login</span></p></div>
        </div>

        <div className="text-center mt-6"><p className="text-txt-muted text-xs">{lang === 'ar' ? 'تصميم' : 'Designed by'} <span className="text-accent font-semibold">WAEL SAMIR</span> © 2025</p></div>
      </div>
    </div>
  );
};
