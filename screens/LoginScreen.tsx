/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { SparklesIcon, GoogleIcon } from '../components/icons';

const LoginScreen: React.FC = () => {
  const { login, signUp, loginWithGoogle } = useAuth();
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (isSigningUp && password !== confirmPassword) {
      setError(t.passwordsDoNotMatchError);
      return;
    }

    const { error } = isSigningUp 
      ? await signUp(email, password)
      : await login(email, password);

    if (error) {
      setError(error.message);
    } else if (isSigningUp) {
      setMessage(t.signUpSuccessMessage);
      setIsSigningUp(false); // Switch back to login view
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setMessage(null);
    const { error } = await loginWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
            <SparklesIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{isSigningUp ? t.createAccountTitle : t.loginTitle}</h1>
            <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{isSigningUp ? t.createAccountSubtitle : t.loginSubtitle}</p>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-8">
            <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <GoogleIcon className="w-6 h-6" />
                  <span>{t.loginWithGoogle}</span>
                </button>

                <div className="relative flex items-center justify-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-xs">{t.orSeparator}</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.emailLabel}</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.passwordLabel}</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                      required
                    />
                  </div>
                  {isSigningUp && (
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.confirmPasswordLabel}</label>
                        <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t.confirmPasswordPlaceholder}
                        className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                        required
                        />
                    </div>
                  )}
                  {error && (
                    <div className="text-center text-red-500 dark:text-red-400 text-sm">
                        {error}
                    </div>
                  )}
                  {message && (
                    <div className="text-center text-green-600 dark:text-green-400 text-sm">
                        {message}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 text-lg"
                  >
                    {isSigningUp ? t.signUpButton : t.loginButton}
                  </button>
                </form>
            </div>
            <div className="mt-4 text-center text-sm">
                <button onClick={() => { setIsSigningUp(!isSigningUp); setError(null); setMessage(null); }} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {isSigningUp ? t.switchToLogin : t.switchToSignUp}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;