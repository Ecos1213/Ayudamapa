import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useGetPins } from '../../utils/queryHooks';
import { usePins, useFilters, useSyncStatus } from '../../utils/hooks';
import MapContainer from '../components/pins/MapContainer';
import FilterBar from '../components/filters/FilterBar';
import PinDetailModal from '../components/pins/PinDetailModal';
import PinCreationForm from '../components/pins/PinCreationForm';

/**
 * MapPage - Main map view with pins, filtering, and offline support
 */
export default function MapPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: serverPins, isLoading, error } = useGetPins();
  const { pins, setPins } = usePins();
  const { filters } = useFilters();
  const { syncStatus } = useSyncStatus();

  const [selectedPin, setSelectedPin] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);
  const [creationLocation, setCreationLocation] = useState(null);
  const [filteredPins, setFilteredPins] = useState([]);

  // Update pins from server
  useEffect(() => {
    if (serverPins) {
      setPins(serverPins);
    }
  }, [serverPins, setPins]);

  // Apply filters
  useEffect(() => {
    let filtered = pins;

    if (filters.type.length > 0) {
      filtered = filtered.filter((pin) => filters.type.includes(pin.type));
    }

    if (filters.severity.length > 0) {
      filtered = filtered.filter((pin) => filters.severity.includes(pin.severity));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter((pin) => filters.status.includes(pin.status));
    }

    setFilteredPins(filtered);
  }, [pins, filters]);

  const handleMapClick = (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    setCreationLocation({ lat, lng });
    setIsCreationFormOpen(true);
  };

  const handlePinClick = (pin) => {
    setSelectedPin(pin);
    setIsDetailModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with sync status */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('map.showMap')}</h1>
              <p className="text-sm text-gray-600">
                {filteredPins.length} {t('common.pins')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Sync status indicator */}
              <div
                className={`px-3 py-2 rounded-full text-sm font-medium ${
                  syncStatus.isOnline
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {syncStatus.isSyncing
                  ? `${t('map.syncing')}`
                  : syncStatus.isOnline
                    ? `${t('map.synced')}`
                    : `${t('map.offline')}`}
              </div>

              {/* Pending changes count */}
              {syncStatus.pendingCount > 0 && (
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {syncStatus.pendingCount} {t('sync.pending')}
                </div>
              )}

              {/* Create pin button */}
              <button
                onClick={() => {
                  setCreationLocation(null);
                  setIsCreationFormOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
              >
                {t('pins.createPin')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700">
              {t('map.errorLoadingMap')}
              <button
                onClick={() => window.location.reload()}
                className="ml-4 font-medium underline"
              >
                {t('common.retry')}
              </button>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-600">{t('map.loadingPins')}</p>
            </div>
          )}
          {!isLoading && !error && (
            <MapContainer
              pins={filteredPins}
              onMapReady={(map) => {
                map.on('click', handleMapClick);
              }}
            >
              {/* Map overlay content can go here */}
            </MapContainer>
          )}
        </div>

        {/* Sidebar with filters */}
        <div className="lg:col-span-1">
          <FilterBar />
        </div>
      </div>

      {/* Modals */}
      <PinDetailModal
        pin={selectedPin}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPin(null);
        }}
        onEdit={(pin) => {
          // TODO: Implement edit functionality
          console.log('Edit pin:', pin);
        }}
      />

      <PinCreationForm
        isOpen={isCreationFormOpen}
        onClose={() => {
          setIsCreationFormOpen(false);
          setCreationLocation(null);
        }}
        location={creationLocation}
        onSuccess={() => {
          setIsCreationFormOpen(false);
        }}
      />
    </div>
  );
}
