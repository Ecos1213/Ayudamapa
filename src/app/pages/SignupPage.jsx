import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    termsAccepted: false,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = t('auth.errors.invalidEmail');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.errors.invalidEmail');
    }

    // Display name validation
    if (!formData.displayName || formData.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    }

    // Password validation
    if (!formData.password) {
      errors.password = t('auth.errors.passwordTooShort');
    } else if (formData.password.length < 6) {
      errors.password = t('auth.errors.passwordTooShort');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('auth.errors.passwordMismatch');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.errors.passwordMismatch');
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    const result = await signup(formData.email, formData.password, formData.displayName);

    if (result.success) {
      setSuccessMessage(t('auth.emailSent'));
      setTimeout(() => {
        navigate('/verify-email', { state: { email: formData.email } });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          {t('auth.signup')}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create an account to get started
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.displayName')}
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                validationErrors.displayName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
              disabled={isLoading}
            />
            {validationErrors.displayName && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              name="termsAccepted"
              id="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="w-4 h-4 mt-1 text-green-600 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-700">
              {t('auth.termsAcceptance')}
            </label>
          </div>
          {validationErrors.termsAccepted && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.termsAccepted}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? t('common.loading') : t('auth.signup')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth.alreadyHaveAccount')}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
            {' '}
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
