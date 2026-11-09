'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useParams, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Home, Mail, Lock, Eye, EyeOff, Loader2, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('Auth');
  const tNav = useTranslations('Navigation');
  const tFooter = useTranslations('HomePage.Footer');
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(mode === 'signup' ? 'signup' : 'login');
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [publishedStatus, setPublishedStatus] = useState({
    PRIVACY_POLICY: false,
    TERMS_OF_SERVICE: false,
    COOKIE_POLICY: false,
    IMPRINT: false,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/legal-pages/published');
        if (res.ok) {
          const data = await res.json();
          setPublishedStatus(data);
        }
      } catch (err) {
        // Fallback silently
      }
    };
    fetchStatus();
  }, []);

  // Sync mode parameter to activeTab
  useEffect(() => {
    if (mode === 'signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [mode]);

  // Auth check on mount
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const res = await fetch('http://localhost:3000/auth/me', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          if (user.role === 'ADMIN') {
            router.push('/control');
          } else {
            router.push('/app');
          }
          return;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkUserAuth();
  }, [router]);

  const switchLocale = (newLocale: string) => {
    router.replace(
      // @ts-expect-error -- Dynamic path types for next-intl
      { pathname, params },
      { locale: newLocale }
    );
  };
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success(t('login.toastSuccess'));
        router.push('/app');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || t('login.toastFailed'));
      }
    } catch (error) {
      toast.error(t('login.toastNetworkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password }),
      });

      if (res.ok) {
        toast.success(t('register.toastSuccess'));
        router.push('/app');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || t('register.toastFailed'));
      }
    } catch (error) {
      toast.error(t('register.toastNetworkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.info("Google Sign-In is not configured yet.");
  };

  if (checkingAuth) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-900 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <span className="text-white/60 text-sm font-medium">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden py-12 md:py-8 px-4 sm:px-6">
      {/* Whole Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/welcome_home.jpg"
          alt="Welcome home"
          fill
          priority
          quality={100}
          className="object-cover"
        />
        {/* Subtle overlay for contrast */}
        <div className="absolute inset-0 bg-black/10" />
        {/* Shadow/Gradient at the bottom to guarantee footer readability */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </div>

      {/* Header Exit Button */}
      <div className="relative z-10 w-full flex justify-between items-center max-w-7xl mx-auto mb-8 md:mb-0">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-md transition-all backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Centered / Right Aligned Card Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center md:justify-end flex-grow mb-12 md:mb-0">
        <div className="w-full max-w-[480px] bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 sm:p-10">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-6 hover:opacity-85 transition-opacity w-fit">
            <Home className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl tracking-tight text-gray-900">
              WohnBoard
            </span>
          </Link>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('unified.title')}
            </h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              {t('unified.subtitle')}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-gray-100 mt-8 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setPassword('');
              }}
              className={`pb-3 text-sm font-semibold transition-all px-2 relative ${
                activeTab === 'login' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tNav('login')}
              {activeTab === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setPassword('');
              }}
              className={`pb-3 text-sm font-semibold transition-all px-2 ml-6 relative ${
                activeTab === 'signup' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tNav('signUp')}
              {activeTab === 'signup' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Forms */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder={t('login.emailLabel')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 shadow-sm text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordLabel')}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 shadow-sm text-sm"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 w-4 h-4"
                  />
                  {t('login.rememberMe')}
                </label>
                <a href="#" className="font-semibold text-blue-600 hover:underline">
                  {t('login.forgotPassword')}
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin mr-1.5" />
                    {t('login.loggingIn')}
                  </>
                ) : t('login.loginButton')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={t('register.fullNameLabel')}
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 shadow-sm text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder={t('register.emailLabel')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 shadow-sm text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('register.passwordLabel')}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 shadow-sm text-sm"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin mr-1.5" />
                    {t('register.registering')}
                  </>
                ) : t('register.registerButton')}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-medium">{t('unified.or')}</span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t('unified.continueWithGoogle')}
          </Button>

          {/* Bottom toggle text */}
          <div className="text-center text-sm text-gray-500 mt-6">
            {activeTab === 'login' ? (
              <>
                {t('login.dontHaveAccount')}{' '}
                <button
                  onClick={() => {
                    setActiveTab('signup');
                    setPassword('');
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {t('login.signUpLink')}
                </button>
              </>
            ) : (
              <>
                {t('register.alreadyHaveAccount')}{' '}
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setPassword('');
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {t('register.loginLink')}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Floating Page Footer */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/80 font-medium pt-8 pb-4">
        <div>
          &copy; {new Date().getFullYear()} {tFooter('copyright')}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {publishedStatus.PRIVACY_POLICY && (
            <Link href="/privacy-policy" className="hover:text-white hover:underline">{tFooter('privacy')}</Link>
          )}
          {publishedStatus.TERMS_OF_SERVICE && (
            <Link href="/terms-of-service" className="hover:text-white hover:underline">{tFooter('terms')}</Link>
          )}
          {publishedStatus.COOKIE_POLICY && (
            <Link href="/cookie-policy" className="hover:text-white hover:underline">{tFooter('cookies')}</Link>
          )}
          {publishedStatus.IMPRINT && (
            <Link href="/imprint" className="hover:text-white hover:underline">
              {locale === 'de' ? 'Impressum' : 'Imprint'}
            </Link>
          )}
          <span className="text-white/20 hidden sm:inline">|</span>
          <div className="flex items-center gap-3">
            <button onClick={() => switchLocale('en')} className={`hover:text-white transition-colors ${locale === 'en' ? 'text-white font-bold underline underline-offset-4' : ''}`}>EN</button>
            <button onClick={() => switchLocale('de')} className={`hover:text-white transition-colors ${locale === 'de' ? 'text-white font-bold underline underline-offset-4' : ''}`}>DE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
