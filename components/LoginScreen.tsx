import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  lang: 'en' | 'ar';
}

interface UserAccount {
  username: string;
  password: string;
  email: string;
  createdAt: number;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getUsers = (): UserAccount[] => {
    const users = localStorage.getItem('masri-users');
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: UserAccount[]) => { localStorage.setItem('masri-users', JSON.stringify(users)); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields'); return; }
    if (username === 'admin' && password === 'W@el_2010') {
      localStorage.setItem('masri-current-user', JSON.stringify({ username: 'admin', role: 'admin', createdAt: Date.now() }));
      onLogin('admin');
      return;
    }
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (found) { localStorage.setItem('masri-current-user', JSON.stringify({ username: found.username, role: 'user', createdAt: found.createdAt })); onLogin(found.username); }
    else { setError(lang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password'); }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!username.trim() || !password.trim() || !email.trim()) { setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'); return; }
    if (password.length < 6) { setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'); return; }
    if (username === 'admin') { setError(lang === 'ar' ? 'اسم المستخدم محجوز' : 'Username is reserved'); return; }
    const users = getUsers();
    if (users.find(u => u.username === username)) { setError(lang === 'ar' ? 'اسم المستخدم مستخدم بالفعل' : 'Username already exists'); return; }
    const newUser: UserAccount = { username, password, email, createdAt: Date.now() };
    users.push(newUser);
    saveUsers(users);
    setSuccess(lang === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
    setIsLogin(true);
    setPassword(''); setConfirmPassword(''); setEmail('');
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl input-soft text-sm text-txt-primary placeholder-txt-muted";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-soft mb-4">
            <i className="fas fa-microphone text-accent text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">{lang === 'ar' ? 'ستوديو مصر' : 'MASRI Studio'}</h1>
          <p className="text-txt-muted text-sm mt-1">{lang === 'ar' ? 'توليد صوتي بالذكاء الاصطناعي' : 'AI Voice Generation'}</p>
        </div>

        {/* Card */}
        <div className="card-soft p-6">
          {/* Tab Toggle */}
          <div className="flex bg-surface2 rounded-xl p-1 mb-6">
            <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-primary text-accent shadow-sm' : 'text-txt-muted'}`}>{lang === 'ar' ? 'تسجيل دخول' : 'Login'}</button>
            <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-primary text-accent shadow-sm' : 'text-txt-muted'}`}>{lang === 'ar' ? 'حساب جديد' : 'Register'}</button>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs"><i className="fas fa-exclamation-circle ml-2"></i>{error}</div>}
          {success && <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs"><i className="fas fa-check-circle ml-2"></i>{success}</div>}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-user"></i></div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'} className={`${inputClass} pr-10`} />
              </div>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-lock"></i></div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'} className={`${inputClass} pr-10 pl-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-accent"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i></button>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-dim transition-all btn-soft">{lang === 'ar' ? 'دخول' : 'Sign In'}</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-user"></i></div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'} className={`${inputClass} pr-10`} />
              </div>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-envelope"></i></div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} className={`${inputClass} pr-10`} />
              </div>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-lock"></i></div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'} className={`${inputClass} pr-10 pl-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-accent"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i></button>
              </div>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txt-muted"><i className="fas fa-lock"></i></div>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} className={`${inputClass} pr-10`} />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-dim transition-all btn-soft">{lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}</button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-border text-center">
            <p className="text-txt-muted text-xs">{lang === 'ar' ? 'مسؤول التطبيق؟ ' : 'Admin? '}<span className="text-accent font-medium">Admin Login</span></p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-txt-muted text-xs">{lang === 'ar' ? 'تصميم' : 'Designed by'} <span className="text-accent font-medium">WAEL SAMIR</span> © 2025</p>
        </div>
      </div>
    </div>
  );
};
