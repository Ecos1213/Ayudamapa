import { useTranslation } from 'react-i18next';
import { useDeletePin } from '../../../utils/queryHooks';
import { useAuth } from '../../../hooks/useAuth';

/**
 * PinDetailModal - Display pin details and allow editing/deletion
 */
export default function PinDetailModal({ pin, isOpen, onClose, onEdit }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const deletePin = useDeletePin();

  if (!isOpen || !pin) return null;

  const isOwner = user?.id === pin.createdBy;
  const canDelete = isOwner;
  const canEdit = isOwner;

  const handleDelete = async () => {
    if (confirm(t('pins.confirmDelete'))) {
      await deletePin.mutateAsync(pin.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t('pins.details')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(
                pin.severity
              )}`}
            >
              {t(`pins.${pin.severity}`)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                pin.status
              )}`}
            >
              {t(`pins.${pin.status}`)}
            </span>
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">{t('pins.pinType')}</label>
            <p className="text-gray-900">{t(`pins.${pin.type}`)}</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">{t('pins.description')}</label>
            <p className="text-gray-900 text-sm">{pin.description}</p>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700">{t('pins.location')}</label>
            <p className="text-gray-900 text-sm">
              {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
            </p>
          </div>

          {/* Creator & Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-700">{t('pins.creator')}</label>
              <p className="text-gray-900">{pin.creatorName || 'Anonymous'}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">{t('pins.createdAt')}</label>
              <p className="text-gray-900">{new Date(pin.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Supply Requests */}
          {pin.supplyRequests && pin.supplyRequests.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('pins.supplyRequests')}
              </label>
              <ul className="mt-2 space-y-2">
                {pin.supplyRequests.map((supply) => (
                  <li key={supply.id} className="text-sm bg-blue-50 p-2 rounded">
                    <p className="font-medium">{supply.itemType}</p>
                    <p className="text-gray-600">Qty: {supply.quantity}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Volunteer Assignments */}
          {pin.volunteerAssignments && pin.volunteerAssignments.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('pins.volunteerAssignments')}
              </label>
              <ul className="mt-2 space-y-2">
                {pin.volunteerAssignments.map((volunteer) => (
                  <li key={volunteer.id} className="text-sm bg-green-50 p-2 rounded">
                    <p className="font-medium">{volunteer.volunteerName}</p>
                    <p className="text-gray-600">{volunteer.skillsOffered}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            {canEdit && (
              <button
                onClick={() => onEdit(pin)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
              >
                {t('common.edit')}
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deletePin.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded transition"
              >
                {deletePin.isPending ? t('common.loading') : t('common.delete')}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded transition"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSeverityColor(severity) {
  const colors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
}

function getStatusColor(status) {
  const colors = {
    reported: 'bg-blue-100 text-blue-800',
    verified: 'bg-indigo-100 text-indigo-800',
    resolved: 'bg-green-100 text-green-800',
    inProgress: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
