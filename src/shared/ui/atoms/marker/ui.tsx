import { markerNames } from '@/shared/data/marker';
import { Icon } from 'leaflet';
import { FC, PropsWithChildren, useMemo, useRef } from 'react';
import { Marker } from 'react-leaflet';

const MarkerIcons = markerNames.map(
  (markerName) =>
    new Icon({
      iconUrl: `/markers/${markerName}.png`,
      iconSize: [32, 32], // size of the icon
      iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
      popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
    })
);

const ArmaMarker: FC<
  PropsWithChildren<{
    x: number;
    y: number;
    icon: Icon;
    draggable?: boolean;
    onUpdatePosition?: (x: number, y: number) => void;
  }>
> = ({ children, x, y, icon, draggable = true, onUpdatePosition }) => {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();

          onUpdatePosition?.(lng, lat);
        }
      },
    }),
    []
  );

  return (
    <Marker
      position={[y, x]}
      icon={icon}
      draggable={draggable}
      ref={markerRef}
      eventHandlers={eventHandlers}>
      {children}
    </Marker>
  );
};

export { ArmaMarker, MarkerIcons };
