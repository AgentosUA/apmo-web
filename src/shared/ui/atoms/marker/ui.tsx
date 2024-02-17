import { Icon } from 'leaflet';
import { FC, PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { Marker, Tooltip } from 'react-leaflet';

import styles from './ui.module.scss';
import classNames from 'classnames';
import Image from 'next/image';

const MarkerIconComponent: FC<{
  markerName: string;
  color: string;
  className?: string;
  width?: number | string;
  height?: number;
  onClick?: () => void;
}> = ({ markerName, color, className, width = 32, height = 32, onClick }) => (
  <Image
    src={`/markers/${markerName}.png`}
    className={classNames(styles[`${color}Filter`], className)}
    width={Number(width)}
    height={height}
    onClick={onClick}
    alt='marker'
  />
);

const MarkerIcon = (
  markerName: string,
  color: string,
  width = 32,
  height = 32
) => {
  return new Icon({
    iconUrl: `/markers/${markerName}.png`,
    iconSize: [width, height], // size of the icon
    iconAnchor: [width / 2, height / 2], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor,
    className: classNames(styles[`${color}Filter`]),
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
    onDelete?: () => void;
  }>
> = ({
  children,
  x,
  y,
  icon,
  color = 'Default',
  draggable = true,
  onUpdatePosition,
  onDelete,
}) => {
  const markerRef = useRef(null);

  const onDeleteMarker = (e: KeyboardEvent) => {
    if (e.key === 'Delete') {
      onDelete?.();
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();

          onUpdatePosition?.(lng, lat);
        }
      },

      mouseover() {
        document.addEventListener('keydown', onDeleteMarker);
      },

      mouseout() {
        document.removeEventListener('keydown', onDeleteMarker);
      },
    }),
    []
  );

  useEffect(() => {
    return document.removeEventListener('keydown', onDeleteMarker);
  }, []);

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

export { ArmaMarker, MarkerIcon, MarkerIconComponent };
