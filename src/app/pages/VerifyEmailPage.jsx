import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../utils/apiClient';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(location.state?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Check for verification token in URL query params
  useEffect(() => {
    const checkVerification = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        setIsLoading(true);
        try {
          await apiClient.post('/auth/verify-email', { token });
          setIsVerified(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } catch (err) {
          setError(err.message || 'Verification failed');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkVerification();
  }, [location.search, navigate]);

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address required');
      return;
    }

    setResendLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/resend-verification', { email });
      setError('');
      alert(t('auth.emailSent'));
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {t('auth.verifyEmail')}
          </h1>

          {isVerified ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">{t('auth.emailVerified')}</p>
              <p className="text-gray-600 text-sm">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                {email
                  ? `We sent a verification link to ${email}`
                  : 'Click the verification link in your email to confirm your account'}
              </p>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                  {t('common.loading')}
                </div>
              )}

              {email && (
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200 mb-4"
                >
                  {resendLoading
                    ? t('common.loading')
                    : t('auth.resendVerification')}
                </button>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {t('common.back')} to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
