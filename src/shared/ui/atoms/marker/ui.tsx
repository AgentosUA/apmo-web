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
import { Marker, Popup, Rectangle, Tooltip } from 'react-leaflet';

import 'leaflet-rotatedmarker';

import { Unit, Vehicle } from '@/entities/mission/types';

import styles from './ui.module.scss';

import { View } from '../../quarks/view';

import Ellipse from '../../quarks/ellipse-leaflet/ui';
import { MarkerColorHEX } from '@/shared/data/marker';
import { getVehicleIconSizeByType } from './lib';

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
  markerName = '',
  color = 'Default',
  size: number | number[] = 1,
  width = 32,
  height = 32
) => {
  if (!markerName || ['ellipse', 'line'].includes(markerName)) return;

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
    type?: string;
    draggable?: boolean;
    onUpdatePosition?: (x: number, y: number) => void;
    onDelete?: () => void;
  }>
> = memo(
  ({
    children,
    x = 0,
    y = 0,
    icon,
    direction = 0,
    color = 'Default',
    draggable = true,
    type,
    size,
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

    if (type === 'ellipse') {
      return (
        <Ellipse
          center={[y, x]}
          radii={size}
          tilt={0}
          eventHandlers={eventHandlers}
          options={{
            color: MarkerColorHEX[color as keyof typeof MarkerColorHEX],
            fillColor: MarkerColorHEX[color as keyof typeof MarkerColorHEX],
            fillOpacity: 0.5,
            opacity: 1,
            weight: 0,
          }}
        />
      );
    }

    if (type === 'line') {
      const ySize = Array.isArray(size) ? size?.[0] : 0;
      const xSize = Array.isArray(size) ? size?.[1] : 0;

      return (
        <Rectangle
          weight={1}
          eventHandlers={eventHandlers}
          color={MarkerColorHEX[color as keyof typeof MarkerColorHEX]}
          bounds={[
            [y + ySize, x + xSize],
            [y - ySize, x - xSize],
          ]}
        />
      );
    }

    return (
      <Marker
        ref={markerRef}
        position={[y, x]}
        icon={icon ? icon : new Icon({ iconUrl: `/icons/unknown.svg` })}
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
        {type === 'group' && data.description}
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

const VehicleMarker: FC<{
  data: Vehicle;
}> = memo(({ data }) => {
  const size = getVehicleIconSizeByType(data);

  const icon = new Icon({
    iconUrl: `/icons/${data.type}.svg`,
    iconSize: [size, size],
    className: classNames(styles[data.type]),
  });

  return (
    <Marker
      zIndexOffset={1}
      icon={icon}
      position={[data.position.coordinates.y, data.position.coordinates.x]}>
      <Popup closeOnEscapeKey>{data.description}</Popup>
    </Marker>
  );
});

VehicleMarker.displayName = 'VehicleMarker';

UnitMarker.displayName = 'UnitMarker';

export {
  ArmaMarker,
  MarkerIcon,
  MarkerIconComponent,
  LocationMarker,
  UnitMarker,
  VehicleMarker,
};

export type { Location, LocationType };
