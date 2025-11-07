'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      // Wait a bit for auth state to update, then redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Wait a bit for auth state to update, then redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-background-light to-gray-100 dark:from-background-dark dark:to-gray-900">
      <div className="flex h-full grow flex-col">
        <div className="px-4 flex flex-1 justify-center items-center py-5">
          <div className="w-full max-w-4xl animate-scale-in">
            <div className="bg-white dark:bg-background-dark/50 shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-200 dark:border-gray-700">
              {/* Left Panel: Branding */}
              <div className="relative hidden md:flex flex-col items-center justify-center p-8 bg-primary/10 dark:bg-primary/20">
                <div className="w-full h-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none" 
                     style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB8ba-p0si1RHtLD715xCcdTltAHg09paNGBzeDa-ucJUPpsJGhLnXbhlTqvY1KkxEmw9SiyNr_LQqIx0Eg7dSnCH-fOXtXTg7BfYSzY9_3eseZjLZbYs6Unueo_P76A60SD_gGxg2Xmvh4dcXH8REEKTyexb0iJYWOUwnoM_GyiYF-tBTZElkjeNm8zd2bASjA3eMqciikxClEl9AtbK072XjYD1oPOFBr7SfvpVUgtGhxAYltPaNcB1MCT7DGnbNHjfFex3cZmtQ")'}}
                ></div>
                <div className="absolute inset-0 bg-primary/80 dark:bg-primary/90 flex flex-col items-start justify-end p-8 text-white">
                  <h1 className="text-white tracking-light text-[32px] font-bold leading-tight pb-3">
                    Edgars Creek IT Support Portal
                  </h1>
                  <p className="text-white/90 text-base font-normal leading-normal">
                    Your one-stop shop for tech help.
                  </p>
                </div>
              </div>

              {/* Right Panel: Form */}
              <div className="flex flex-col p-8 sm:p-12">
                {/* Mobile Header */}
                <div className="md:hidden mb-8 text-center">
                  <h1 className="text-gray-900 dark:text-white tracking-light text-[28px] font-bold leading-tight pb-2">
                    IT Support Portal
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
                    Edgars Creek Primary School
                  </p>
                </div>

                {/* Toggle */}
                <div className="flex">
                  <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gray-100 dark:bg-background-dark/60 p-1">
                    <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-colors ${isLogin ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className="truncate text-sm font-medium">Login</span>
                      <input 
                        checked={isLogin} 
                        onChange={() => setIsLogin(true)}
                        className="invisible w-0" 
                        type="radio" 
                      />
                    </label>
                    <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-colors ${!isLogin ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className="truncate text-sm font-medium">Register</span>
                      <input 
                        checked={!isLogin}
                        onChange={() => setIsLogin(false)}
                        className="invisible w-0" 
                        type="radio" 
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <h1 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight pb-1 pt-5">
                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal pb-6">
                    {isLogin ? 'Please enter your details to sign in.' : 'Please fill in your details to register.'}
                  </p>

                  {/* Google Sign In */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex items-center justify-center w-full gap-3 px-4 py-3 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#fbc02d"/>
                      <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#e53935"/>
                      <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4caf50"/>
                      <path d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C44.437,36.218,48,30.455,48,24C48,22.659,47.862,21.35,47.611,20.083z" fill="#1565c0"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center my-6">
                    <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
                    <span className="mx-4 text-xs font-medium text-gray-500 dark:text-gray-400">OR</span>
                    <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start gap-3 animate-shake">
                      <span className="text-lg font-bold">✕</span>
                      <span className="flex-1">{error}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                          placeholder="John Smith"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email / Username
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    {isLogin && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800 dark:text-gray-300">
                            Remember Me
                          </label>
                        </div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-primary hover:text-primary/80">
                            Forgot Password?
                          </a>
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {loading && (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
