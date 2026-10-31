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

  const saveUsers = (users: UserAccount[]) => {
    localStorage.setItem('masri-users', JSON.stringify(users));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    // Check admin credentials
    if (username === 'admin' && password === 'W@el_2010') {
      localStorage.setItem('masri-current-user', JSON.stringify({ username: 'admin', role: 'admin', createdAt: Date.now() }));
      onLogin('admin');
      return;
    }

    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    
    if (found) {
      localStorage.setItem('masri-current-user', JSON.stringify({ username: found.username, role: 'user', createdAt: found.createdAt }));
      onLogin(found.username);
    } else {
      setError(lang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim() || !email.trim()) {
      setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (username === 'admin') {
      setError(lang === 'ar' ? 'اسم المستخدم محجوز' : 'Username is reserved');
      return;
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
      setError(lang === 'ar' ? 'اسم المستخدم مستخدم بالفعل' : 'Username already exists');
      return;
    }

    const newUser: UserAccount = {
      username,
      password,
      email,
      createdAt: Date.now()
    };

    users.push(newUser);
    saveUsers(users);
    setSuccess(lang === 'ar' ? 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن' : 'Account created successfully! You can login now');
    setIsLogin(true);
    setPassword('');
    setConfirmPassword('');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-900 shadow-2xl shadow-purple-500/20 mb-4 icon-3d">
            <i className="fas fa-microphone-lines text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient">MASRI STUDIO</h1>
          <p className="text-txt-muted text-sm mt-2">
            {lang === 'ar' ? 'ستوديو مصر للصوتيات بالذكاء الاصطناعي' : 'Egypt AI Voice Studio'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 shadow-2xl">
          {/* Tab Toggle */}
          <div className="flex bg-highlight rounded-2xl p-1 mb-8 border border-border">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'text-txt-muted hover:text-txt-primary'
              }`}
            >
              <i className="fas fa-sign-in-alt ml-2"></i>
              {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'text-txt-muted hover:text-txt-primary'
              }`}
            >
              <i className="fas fa-user-plus ml-2"></i>
              {lang === 'ar' ? 'إنشاء حساب' : 'Register'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-slide-down">
              <i className="fas fa-exclamation-circle ml-2"></i>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center animate-slide-down">
              <i className="fas fa-check-circle ml-2"></i>
              {success}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">
                  <i className="fas fa-user text-lg"></i>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                  className="w-full pr-12 pl-4 py-4 rounded-xl bg-highlight border border-border text-txt-primary placeholder-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-right"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">
                  <i className="fas fa-lock text-lg"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  className="w-full pr-12 pl-12 py-4 rounded-xl bg-highlight border border-border text-txt-primary placeholder-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted hover:text-accent transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm tracking-wider shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all btn-3d"
              >
                <i className="fas fa-sign-in-alt ml-2"></i>
                {lang === 'ar' ? 'دخول' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Username */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">
                  <i className="fas fa-user text-lg"></i>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                  className="w-full pr-12 pl-4 py-4 rounded-xl bg-highlight border border-border text-txt-primary placeholder-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-right"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">
                  <i className="fas fa-envelope text-lg"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  className="w-full pr-12 pl-4 py-4 rounded-xl bg-highlight border border-border text-txt-primary placeholder-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-right"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">
                  <i className="fas fa-lock text-lg"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  className="w-full pr-12 pl-12 py-4 rounded-xl bg-highlight border border-border text-txt-primary placeholder-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted hover:text-accent transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">
                  <i className="fas fa-lock text-lg"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  className="w-full pr-12 pl-4 py-4 rounded-xl bg-highlight border border-border text-txt-primary placeholder-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-right"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm tracking-wider shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all btn-3d"
              >
                <i className="fas fa-user-plus ml-2"></i>
                {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Admin hint */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-txt-muted text-xs">
              {lang === 'ar' ? 'مسؤول التطبيق؟ ' : 'App Admin? '}
              <span className="text-accent font-bold">Admin Login</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-txt-muted text-xs">
            {lang === 'ar' ? 'تصميم وتطوير' : 'Designed & Developed by'}
            <span className="text-accent font-bold mr-1">WAEL SAMIR</span>
            <span className="text-txt-muted"> © 2025</span>
          </p>
        </div>
      </div>
    </div>
  );
};
