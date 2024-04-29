import Image from 'next/image';

import classNames from 'classnames';

import { Icon, DivIcon, Marker as MarkerLeaflet, MarkerOptions } from 'leaflet';
import {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  memo,
  useState,
} from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet-rotatedmarker';

import { Unit } from '@/entities/mission/types';

import styles from './ui.module.scss';

import { MdClose } from 'react-icons/md';
import { View } from '../../quarks/view';

type LocationType =
  | 'city'
  | 'village'
  | 'local'
  | 'rockarea'
  | 'hill'
  | 'marine';

type Location = [LocationType, string, number, number];

const MarkerIconComponent: FC<{
  markerName: string;
  color: string;
  className?: string;
  width?: number | string;
  height?: number;
  onClick?: () => void;
}> = memo(
  ({ markerName, color, className, width = 32, height = 32, onClick }) => {
    return (
      <Image
        src={`/markers/${markerName}.png`}
        className={classNames(styles[`${color}Filter`], className)}
        width={Number(width)}
        height={height}
        onClick={onClick}
        alt='marker'
      />
    );
  }
);

MarkerIconComponent.displayName = 'MarkerIconComponent';

const MarkerIcon = (
  markerName: string,
  color: string,
  size: number | number[] = 1,
  zoomLevel: number,
  width = 32,
  height = 32
) => {
  if (['ellipse', 'line'].includes(markerName)) {
    const sizeFactor = Math.pow(2, zoomLevel);
    const markerSize = size as [number, number];

    return new DivIcon({
      iconSize: [
        Math.ceil(markerSize[0] * sizeFactor),
        Math.ceil(markerSize[1] * sizeFactor),
      ], // size of the icon
      // iconAnchor: [width / 2, height / 2], // point of the icon which will correspond to marker's location
      popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor,
      className: classNames(styles[`${color}Background`], {
        [styles.ellipsis]: markerName === 'ellipse',
        [styles.line]: markerName === 'line',
      }),
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
    direction?: number;
    icon?: Icon | DivIcon;
    size?: number | number[];
    color?: string;
    draggable?: boolean;
    onUpdatePosition?: (x: number, y: number) => void;
    onDelete?: () => void;
  }>
> = memo(
  ({
    children,
    x,
    y,
    icon,
    direction = 0,
    color = 'Default',
    draggable = true,
    onUpdatePosition,
    onDelete,
  }) => {
    const markerRef = useRef<MarkerLeaflet>(null);

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
      if (markerRef && markerRef?.current?.options) {
        (
          markerRef.current.options as MarkerOptions & { rotationAngle: number }
        ).rotationAngle = direction;
      }

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
  }
);

ArmaMarker.displayName = 'ArmaMarker';

const LocationMarker: FC<{
  data: Location;
}> = memo(({ data: [type, text, x, y] }) => {
  const icon = new DivIcon({
    iconSize: [0, 0],
    popupAnchor: [0, 0],
  });

  return (
    <Marker icon={icon} position={[y, x]}>
      <Tooltip
        direction='right'
        offset={[0, 0]}
        opacity={1}
        permanent
        className={classNames(styles.text, styles[type])}>
        {text}
      </Tooltip>
    </Marker>
  );
});

LocationMarker.displayName = 'LocationMarker';

const UnitMarker: FC<{
  data: Unit;
  units?: Unit[];
  isAllVisible: boolean;
}> = memo(({ isAllVisible, data, units = [] }) => {
  const icon = new Icon({
    iconUrl: `/icons/soldier.svg`,
    iconSize: [16, 16],
    className: classNames(styles[data.side]),
  });

  const [isDescriptionVisible, setIsDescriptionVisible] =
    useState(isAllVisible);

  useEffect(() => {
    setIsDescriptionVisible(isAllVisible);
  }, [isAllVisible]);

  const type = units.length > 0 ? 'group' : 'player';

  return (
    <Marker
      icon={icon}
      eventHandlers={{
        click: () => {
          setIsDescriptionVisible(!isDescriptionVisible);
        },
      }}
      position={[data.position.coordinates.y, data.position.coordinates.x]}>
      <Tooltip
        direction='right'
        offset={[0, 0]}
        opacity={1}
        permanent
        className={classNames(
          styles.unitDescription,
          styles[`${data.side.toLowerCase()}Text`]
        )}>
        {isDescriptionVisible && type === 'player' && data.description}
      </Tooltip>
      <View.Condition if={type === 'group'}>
        <Popup
          closeOnEscapeKey
          eventHandlers={{
            popupclose: () => {
              setIsDescriptionVisible(true);
            },
          }}>
          {type === 'group' && (
            <ol className={styles.unitList}>
              {units.map((item) => (
                <li key={item.id}>{item.description}</li>
              ))}
            </ol>
          )}
        </Popup>
      </View.Condition>
    </Marker>
  );
});

UnitMarker.displayName = 'UnitMarker';

export {
  ArmaMarker,
  MarkerIcon,
  MarkerIconComponent,
  LocationMarker,
  UnitMarker,
};

export type { Location, LocationType };
