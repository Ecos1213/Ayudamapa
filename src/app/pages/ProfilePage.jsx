import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../store/useAppStore';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, isLoading, error } = useAuth();
  const { language, setLanguage } = useAppStore();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    languagePreference: user?.languagePreference || language || 'es',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        languagePreference: user.languagePreference || language || 'es',
      });
    }
  }, [user, language]);

  const validateForm = () => {
    const errors = {};

    if (formData.displayName && formData.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    }

    if (
      formData.phoneNumber &&
      !/^[0-9\s+\-()]+$/.test(formData.phoneNumber)
    ) {
      errors.phoneNumber = 'Invalid phone number format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    // Update app language immediately
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);

    // Update backend profile
    const result = await updateProfile({ languagePreference: newLanguage });
    if (!result.success) {
      setSuccessMessage('');
    } else {
      setSuccessMessage(t('auth.updateLanguage'));
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    const updates = {};
    if (formData.displayName !== user?.displayName) {
      updates.displayName = formData.displayName;
    }
    if (formData.phoneNumber !== user?.phoneNumber) {
      updates.phoneNumber = formData.phoneNumber;
    }
    if (formData.languagePreference !== user?.languagePreference) {
      updates.languagePreference = formData.languagePreference;
    }

    if (Object.keys(updates).length === 0) {
      setSuccessMessage('No changes to save');
      return;
    }

    const result = await updateProfile(updates);
    if (result.success) {
      setSuccessMessage(t('common.success'));
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          {t('auth.profile')}
        </h1>

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

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.displayName')}
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    validationErrors.displayName
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {validationErrors.displayName && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.displayName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.phoneNumber')}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    validationErrors.phoneNumber
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="+34 912 345 678"
                />
                {validationErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.language')}
                </label>
                <select
                  name="languagePreference"
                  value={formData.languagePreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="es">{t('common.spanish')}</option>
                  <option value="en">{t('common.english')}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  {isLoading ? t('common.loading') : t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      displayName: user.displayName || '',
                      phoneNumber: user.phoneNumber || '',
                      languagePreference:
                        user.languagePreference || language || 'es',
                    });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.displayName')}
                </label>
                <p className="text-gray-900">
                  {user.displayName || 'Not set'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.phoneNumber')}
                </label>
                <p className="text-gray-900">
                  {user.phoneNumber || 'Not set'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.language')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      formData.languagePreference === 'es'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {t('common.spanish')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      formData.languagePreference === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {t('common.english')}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {t('auth.editProfile')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
