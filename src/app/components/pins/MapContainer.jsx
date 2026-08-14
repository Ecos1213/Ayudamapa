import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useMapViewport } from '../../../utils/hooks';
import { useTranslation } from 'react-i18next';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

/**
 * MapContainer component - Initialize and manage Leaflet map
 */
export default function MapContainer({ children, onMapReady, onViewportChange, pins = [] }) {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const clusterGroupRef = useRef(null);
  const { mapViewport, setMapViewport } = useMapViewport();
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    const mapInstance = L.map(mapRef.current).setView(mapViewport.center, mapViewport.zoom);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 1,
    }).addTo(mapInstance);

    // Create marker cluster group
    const clusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 16,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        let className = 'marker-cluster ';
        if (childCount < 10) {
          className += 'marker-cluster-small';
        } else if (childCount < 100) {
          className += 'marker-cluster-medium';
        } else {
          className += 'marker-cluster-large';
        }

        return L.divIcon({
          html: `<div><span>${childCount}</span></div>`,
          className,
          iconSize: L.point(40, 40),
        });
      },
    });

    mapInstance.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = mapInstance;

    // Handle map events
    const onMoveEnd = () => {
      const center = mapInstance.getCenter();
      const zoom = mapInstance.getZoom();
      setMapViewport({ center: [center.lat, center.lng], zoom });
      if (onViewportChange) {
        onViewportChange({ center: [center.lat, center.lng], zoom });
      }
    };

    mapInstance.on('moveend', onMoveEnd);

    setMapReady(true);
    if (onMapReady) {
      onMapReady(mapInstance);
    }

    // Cleanup
    return () => {
      mapInstance.off('moveend', onMoveEnd);
      mapInstance.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update pins on map
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current || !mapReady) return;

    // Clear existing markers
    clusterGroupRef.current.clearLayers();
    markersRef.current.clear();

    // Add new markers
    if (pins && pins.length > 0) {
      pins.forEach((pin) => {
        if (pin.latitude && pin.longitude) {
          try {
            const marker = L.marker([pin.latitude, pin.longitude], {
              title: pin.description,
              icon: getMarkerIcon(pin.severity),
            }).bindPopup(`
              <div class="pin-popup">
                <p class="font-bold">${pin.description}</p>
                <p class="text-sm text-gray-600">${pin.type}</p>
              </div>
            `);

            clusterGroupRef.current.addLayer(marker);
            markersRef.current.set(pin.id, marker);
          } catch (error) {
            console.error('Error adding marker:', error);
          }
        }
      });
    }
  }, [pins, mapReady]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      {children}
    </div>
  );
}

/**
 * Get marker icon based on severity
 */
function getMarkerIcon(severity) {
  const iconSizes = [32, 48];
  const colors = {
    critical: '#dc2626', // red
    high: '#ea580c', // orange
    medium: '#eab308', // yellow
    low: '#16a34a', // green
  };

  const color = colors[severity] || colors.low;

  return L.divIcon({
    html: `
      <div class="pin-marker" style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: white; font-weight: bold; font-size: 16px;">●</span>
      </div>
    `,
    className: '',
    iconSize: L.point(32, 32),
    iconAnchor: L.point(16, 16),
    popupAnchor: L.point(0, -16),
  });
}
