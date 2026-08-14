import { useTranslation } from 'react-i18next';
import { useFilters } from '../../../utils/hooks';

/**
 * FilterBar - Toggle buttons to filter pins by type, severity, and status
 */
export default function FilterBar({ onFiltersChange }) {
  const { t } = useTranslation();
  const { filters, setFilters } = useFilters();

  const types = ['damage', 'supply', 'volunteer'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['reported', 'verified', 'inProgress', 'resolved'];

  const handleToggle = (category, value) => {
    setFilters({
      ...filters,
      [category]: filters[category].includes(value)
        ? filters[category].filter((v) => v !== value)
        : [...filters[category], value],
    });

    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [category]: filters[category].includes(value)
          ? filters[category].filter((v) => v !== value)
          : [...filters[category], value],
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      type: [],
      severity: [],
      status: [],
    });
    if (onFiltersChange) {
      onFiltersChange({
        type: [],
        severity: [],
        status: [],
      });
    }
  };

  const hasActiveFilters =
    filters.type.length > 0 || filters.severity.length > 0 || filters.status.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Filter Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t('filters.filterBy')}</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('filters.clearFilters')}
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t('filters.filterByType')}</p>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => handleToggle('type', type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filters.type.includes(type)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t(`pins.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Severity Filters */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t('filters.filterBySeverity')}</p>
        <div className="flex flex-wrap gap-2">
          {severities.map((severity) => (
            <button
              key={severity}
              onClick={() => handleToggle('severity', severity)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filters.severity.includes(severity)
                  ? getSeverityColor(severity, true)
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t(`pins.${severity}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t('filters.filterByStatus')}</p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleToggle('status', status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filters.status.includes(status)
                  ? getStatusColor(status, true)
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t(`pins.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Info */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {t('filters.applied')}: {filters.type.length + filters.severity.length + filters.status.length} filter(s)
          </p>
        </div>
      )}
    </div>
  );
}

function getSeverityColor(severity, isSelected) {
  const colors = {
    low: isSelected ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800',
    medium: isSelected ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800',
    high: isSelected ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800',
    critical: isSelected ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800',
  };
  return colors[severity] || 'bg-gray-200 text-gray-700';
}

function getStatusColor(status, isSelected) {
  const colors = {
    reported: isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800',
    verified: isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800',
    resolved: isSelected ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800',
    inProgress: isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-200 text-gray-700';
}
