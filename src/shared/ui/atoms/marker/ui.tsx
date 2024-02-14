import { Icon } from 'leaflet';
import { FC, PropsWithChildren, useMemo, useRef } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import styles from './ui.module.scss';
import classNames from 'classnames';

const MarkerIcon = (markerName: string, color: string) => {
  return new Icon({
    iconUrl: `/markers/${markerName}.png`,
    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor,
    className: classNames(styles[color]),
  });
};

const ArmaMarker: FC<
  PropsWithChildren<{
    x: number;
    y: number;
    icon: Icon;
    color?: string;
    draggable?: boolean;
    onUpdatePosition?: (x: number, y: number) => void;
  }>
> = ({
  children,
  x,
  y,
  icon,
  color = 'Default',
  draggable = true,
  onUpdatePosition,
}) => {
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
      {children && (
        <Tooltip
          direction='right'
          offset={[0, 0]}
          opacity={1}
          permanent
          className={classNames(styles.text, styles[color])}>
          {children}
        </Tooltip>
      )}
    </Marker>
  );
};

export { ArmaMarker, MarkerIcon };
