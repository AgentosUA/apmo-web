import Image from 'next/image';

import classNames from 'classnames';

import { Icon, DivIcon } from 'leaflet';
import { FC, PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { Marker, Tooltip, ZoomControl } from 'react-leaflet';

import styles from './ui.module.scss';

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
  size: number | number[] = 1,
  zoomLevel: number,
  width = 32,
  height = 32
) => {
  if (markerName === 'ellipse') {
    const markerSize = size as [number, number];

    return new DivIcon({
      iconSize: [
        Math.ceil(markerSize[0] * (zoomLevel / 9)),
        Math.ceil(markerSize[1] * (zoomLevel / 9)),
      ], // size of the icon
      // iconAnchor: [width / 2, height / 2], // point of the icon which will correspond to marker's location
      popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor,
      className: classNames(styles.ellipsis, styles[`${color}Background`]),
    });
  }

  const markerSize = size as number;

  return new Icon({
    iconUrl: `/markers/${markerName}.png`,
    iconSize: [width * markerSize, height * markerSize], // size of the icon
    iconAnchor: [(width * markerSize) / 2, (height * markerSize) / 2], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor,
    className: classNames(styles[`${color}Filter`]),
  });
};

const ArmaMarker: FC<
  PropsWithChildren<{
    x: number;
    y: number;
    icon: Icon;
    size?: number | number[];
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
      ref={markerRef}
      position={[y, x]}
      icon={icon}
      draggable={draggable}
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
