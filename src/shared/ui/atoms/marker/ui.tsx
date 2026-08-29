import Image from 'next/image';

import {
  Icon,
  DivIcon,
  Marker as MarkerLeaflet,
  MarkerOptions,
  LatLngExpression,
} from 'leaflet';

import {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  memo,
  useState,
} from 'react';
import { Marker, Polygon, Popup, Rectangle, Tooltip } from 'react-leaflet';

import 'leaflet-rotatedmarker';

import { Unit, Vehicle } from '@/entities/mission/types';

import { MarkerColorHEX } from '@/shared/data/marker';
import {
  getMarkerFilter,
  getMarkerFilterClass,
  getMarkerTextColor,
  LOCATION_TYPE_CLASSES,
  MARKER_TOOLTIP_BASE,
  SIDE_TEXT_CLASSES,
} from '@/shared/ui/styles/marker-colors';
import { cn } from '@/shared/utils/cn';
import {
  calculateRotatedRectangleCorners,
  getVehicleIconSizeByType,
} from './lib';

import { View } from '../../quarks/view';

import Ellipse from '../../quarks/ellipse-leaflet/ui';

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
    const filter = getMarkerFilter(color);

    return (
      <Image
        src={`/markers/${markerName}.png`}
        className={className}
        style={filter ? { filter } : undefined}
        width={Number(width)}
        height={height}
        onClick={onClick}
        alt="marker"
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
    iconSize: [width * markerSize, height * markerSize],
    iconAnchor: [(width * markerSize) / 2, (height * markerSize) / 2],
    popupAnchor: [0, 0],
    className: getMarkerFilterClass(color),
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
          tilt={direction}
          eventHandlers={eventHandlers}
          options={{
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            opacity: 1,
            weight: 0,
          }}
        />
      );
    }

    if (type === 'line' && Array.isArray(size)) {
      const height = size[1] * 2;
      const width = size[0] * 1.5;

      const corners = calculateRotatedRectangleCorners(
        [y, x],
        width,
        height,
        direction
      );

      if (
        isNaN(corners[0][0]) ||
        isNaN(corners[0][1]) ||
        isNaN(corners[1][0]) ||
        isNaN(corners[1][1])
      )
        return null;

      return (
        <Polygon
          positions={corners as LatLngExpression[]}
          fillColor={MarkerColorHEX[color as keyof typeof MarkerColorHEX]}
          opacity={10}
          interactive
          stroke={false}
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
            direction="right"
            offset={[0, 0]}
            opacity={1}
            permanent
            className={cn(
              MARKER_TOOLTIP_BASE,
              type ? LOCATION_TYPE_CLASSES[type.toLowerCase()] : undefined
            )}
            style={{ color: getMarkerTextColor(color) }}
          >
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
        direction="right"
        offset={[0, 0]}
        opacity={1}
        permanent
        className={cn(
          MARKER_TOOLTIP_BASE,
          LOCATION_TYPE_CLASSES[type.toLowerCase()]
        )}
      >
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
    className: getMarkerFilterClass(data.side),
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
        direction="right"
        offset={[0, 0]}
        opacity={1}
        permanent
        className={cn(
          'text-xs font-normal shadow-none !text-center ml-[35px] left-[15px] p-0 leading-normal capitalize [text-shadow:0_0_1px_rgba(0,0,0,0.4)]',
          SIDE_TEXT_CLASSES[`${data.side.toLowerCase()}text`]
        )}
      >
        {isDescriptionVisible &&
          type === 'player' &&
          (data.description ?? data.type)}
        {type === 'group' && (data.description ?? data.type)}
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
            <ol className="relative text-black text-sm text-left">
              {units.map((item) => (
                <li key={item.id}>{item.description ?? item.type}</li>
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
  });

  return (
    <Marker
      zIndexOffset={1}
      icon={icon}
      position={[data.position.coordinates.y, data.position.coordinates.x]}>
      <Popup closeOnEscapeKey>{data.description ?? data.type}</Popup>
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
