/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { SparklesIcon } from '../components/icons';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (!success) {
      setError(t.loginError);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
            <SparklesIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.loginTitle}</h1>
            <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.loginSubtitle}</p>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-8">
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
              {error && (
                <div className="text-center text-red-500 dark:text-red-400 text-sm">
                    {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 text-lg"
              >
                {t.loginButton}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;