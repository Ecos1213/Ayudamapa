import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatePin } from '../../../utils/queryHooks';
import { validatePinData } from '../../../utils/validation';

/**
 * PinCreationForm - Form to create new pins
 */
export default function PinCreationForm({ isOpen, onClose, location = null, onSuccess }) {
  const { t } = useTranslation();
  const createPin = useCreatePin();

  const [formData, setFormData] = useState({
    latitude: location?.lat || '',
    longitude: location?.lng || '',
    type: 'damage',
    severity: 'medium',
    description: '',
    photo: null,
    address: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        photo: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
    setValidationErrors({});

    // Validate form data
    const validation = validatePinData({
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      type: formData.type,
      severity: formData.severity,
      description: formData.description,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const pinData = {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        address: formData.address,
      };

      await createPin.mutateAsync(pinData);

      // Success
      setFormData({
        latitude: '',
        longitude: '',
        type: 'damage',
        severity: 'medium',
        description: '',
        photo: null,
        address: '',
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t('pins.createPin')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Location - Latitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pins.location')} - Latitude
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="0.00001"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                validationErrors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="40.4168"
              disabled={isSubmitting}
            />
          </div>

          {/* Location - Longitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="0.00001"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                validationErrors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="-3.7038"
              disabled={isSubmitting}
            />
            {validationErrors.location && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.location}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pins.pinType')}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
            >
              <option value="damage">{t('pins.damage')}</option>
              <option value="supply">{t('pins.supply')}</option>
              <option value="volunteer">{t('pins.volunteer')}</option>
            </select>
            {validationErrors.type && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.type}</p>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pins.severity')}
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
            >
              <option value="low">{t('pins.low')}</option>
              <option value="medium">{t('pins.medium')}</option>
              <option value="high">{t('pins.high')}</option>
              <option value="critical">{t('pins.critical')}</option>
            </select>
            {validationErrors.severity && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.severity}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pins.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                validationErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the situation..."
              disabled={isSubmitting}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pins.photo')}
            </label>
            <input
              type="file"
              name="photo"
              onChange={handleChange}
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
            />
            {formData.photo && (
              <p className="mt-1 text-sm text-gray-600">{formData.photo.name}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || createPin.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded transition"
            >
              {isSubmitting || createPin.isPending ? t('common.loading') : t('pins.createPin')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded transition"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
