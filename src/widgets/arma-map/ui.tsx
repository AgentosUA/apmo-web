'use client';

/**
 * Map widget. This module is only ever loaded on the client
 * (pages import it with `dynamic(..., { ssr: false })`), so Leaflet/MapLibre
 * can be imported statically below.
 */
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { mapsEntity } from '@/entities/maps';
import { Marker, SWTMarkerID, markersEntity } from '@/entities/markers';
import {
  getMarkerColorName,
  getMarkerDirection,
  getMarkerSize,
  getMarkerText,
  getMarkerType,
} from '@/entities/markers/lib';
import { missionEntity } from '@/entities/mission';
import { callsigns } from '@/entities/mission/data';
import { Group, MissionMarker, Side, Vehicle } from '@/entities/mission/types';
import { createMarkerEntity } from '@/features/markers/create-marker';
import { CreateMarker } from '@/features/markers/create-marker/ui';
import type { CanvasItem } from '@/shared/lib/ocap/canvas-layer';
import {
  getSideIconColor,
  getSideLabelColor,
  resolveMarkerColor,
  resolveShapeColor,
  resolveTextColor,
} from '@/shared/lib/ocap/colors';
import { radToDeg } from '@/shared/lib/ocap/coordinates';
import { resolveMarkerUrl } from '@/shared/lib/ocap/icons';
import type { ShapeItem } from '@/shared/lib/ocap/shapes';
import { markerColorNames } from '@/shared/data/marker';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import { BasicMap, CanvasItemsLayer, ShapesLayer, useArmaMap } from '@/shared/ui/atoms/basic-map/ui';
import type { Location } from '@/shared/ui/atoms/marker';
import { useMounted } from '@/shared/ui/hooks/use-mounted';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { generateRandomId } from '@/shared/utils/string';

/** Base pixel size of a size-1 Arma icon marker. */
const MARKER_ICON_SIZE = 32;

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

// --------------- mission vehicles ---------------

const VEHICLE_ICONS: Record<Vehicle['type'], { url: string; size: number; tint: boolean }> = {
  land: { url: '/markers/car.svg', size: 24, tint: true },
  air: { url: '/markers/heli.svg', size: 32, tint: true },
  static: { url: '/icons/static.svg', size: 20, tint: false },
  crate: { url: '/icons/crate.svg', size: 16, tint: false },
  unknown: { url: '/markers/unknown.svg', size: 24, tint: true },
};

/** Empty vehicles use OCAP's "unknown" side color. */
const EMPTY_VEHICLE_COLOR = getSideIconColor('Unknown');

// --------------- location labels ---------------

const LOCATION_STYLES: Record<string, { size: number; weight: number; color?: string; italic?: boolean }> = {
  capital: { size: 18, weight: 600 },
  city: { size: 15, weight: 500 },
  village: { size: 12, weight: 500 },
  local: { size: 11, weight: 400, italic: true },
  rockarea: { size: 10, weight: 400, italic: true },
  hill: { size: 10, weight: 400 },
  marine: { size: 11, weight: 400, color: '#0062f5', italic: true },
};

const toLocationItems = (locations: Location[]): CanvasItem[] =>
  locations.map(([type, text, x, y], index) => {
    const style = LOCATION_STYLES[type?.toLowerCase()] ?? LOCATION_STYLES.local;
    return {
      id: `location-${index}`,
      x,
      y,
      label: {
        text,
        color: style.color ?? '#1a1a1a',
        size: style.size,
        weight: style.weight,
        italic: style.italic,
        align: 'center',
      },
    };
  });

// --------------- SWT (Sweet Markers) ---------------

const toSize = (size: number | number[] | undefined): [number, number] => {
  if (Array.isArray(size)) return [Number(size[0]) || 1, Number(size[1] ?? size[0]) || 1];
  const value = Number(size) || 1;
  return [value, value];
};

const toSwtShape = (marker: Marker, kind: 'ellipse' | 'line'): ShapeItem => {
  const [a, b] = toSize(getMarkerSize(marker));
  const [x, y] = marker.data[SWTMarkerID.coordinates];

  return {
    id: `swt-${marker.id}`,
    // SWT lines are Arma RECTANGLE markers: [half thickness, half length].
    kind: kind === 'ellipse' ? 'ellipse' : 'rectangle',
    x,
    y,
    a,
    b,
    direction: getMarkerDirection(marker) ?? 0,
    color: resolveShapeColor(getMarkerColorName(marker)),
    brush: kind === 'ellipse' ? 'Solid' : 'SolidFull',
    // View-only plans: no handlers = not interactive.
    ...(markersEntity.isReadOnly
      ? {}
      : {
          onDelete: () => markersEntity.deleteMarker(marker.id),
          onDragEnd: ([nx, ny]: [number, number]) => markersEntity.updateMarker(marker.id, nx, ny),
          onRotateEnd: (direction: number) =>
            markersEntity.updateMarkerDirection(marker.id, direction),
        }),
  };
};

const toSwtIcon = (marker: Marker): CanvasItem => {
  const type = getMarkerType(marker);
  const colorName = getMarkerColorName(marker);
  const [w, h] = toSize(getMarkerSize(marker));
  const [x, y] = marker.data[SWTMarkerID.coordinates];
  const text = getMarkerText(marker);

  return {
    id: `swt-${marker.id}`,
    x,
    y,
    direction: getMarkerDirection(marker) ?? 0,
    icon: {
      url: resolveMarkerUrl(type),
      color: resolveMarkerColor(colorName, type),
      size: [MARKER_ICON_SIZE * w, MARKER_ICON_SIZE * h],
    },
    label: text ? { text, color: resolveTextColor(colorName, type), size: 14 } : undefined,
    ...(markersEntity.isReadOnly
      ? { draggable: false }
      : {
          draggable: true,
          onDragEnd: (_: CanvasItem, [nx, ny]: [number, number]) =>
            markersEntity.updateMarker(marker.id, nx, ny),
          onRotateEnd: (_: CanvasItem, direction: number) =>
            markersEntity.updateMarkerDirection(marker.id, direction),
          onResize: (_: CanvasItem, direction: number) =>
            markersEntity.changeMarkerSize(marker.id, direction),
          onDelete: () => markersEntity.deleteMarker(marker.id),
        }),
  };
};

// --------------- mission (sqm) markers ---------------

const isAreaMarker = (marker: MissionMarker) =>
  [marker.markerType, marker.type].some((value) => ['ELLIPSE', 'RECTANGLE'].includes(String(value).toUpperCase()));

const toMissionShape = (marker: MissionMarker): ShapeItem => {
  const isEllipse = [marker.markerType, marker.type].some((value) => String(value).toUpperCase() === 'ELLIPSE');
  return {
    id: `mission-${marker.id}`,
    kind: isEllipse ? 'ellipse' : 'rectangle',
    x: marker.position.coordinates.x ?? 0,
    y: marker.position.coordinates.y ?? 0,
    a: marker.width ?? 1,
    b: marker.height ?? 1,
    direction: marker.position.angle ?? 0,
    color: resolveShapeColor(marker.colorName),
    brush: marker.fillName,
  };
};

const toMissionIcon = (marker: MissionMarker): CanvasItem | null => {
  const type = marker.type;
  if (!type || type.toLowerCase() === 'empty') return null;

  const [w, h] = [marker.width || 1, marker.height || 1];

  return {
    id: `mission-${marker.id}`,
    x: marker.position.coordinates.x ?? 0,
    y: marker.position.coordinates.y ?? 0,
    direction: marker.position.angle ?? 0,
    icon: {
      url: resolveMarkerUrl(type),
      color: resolveMarkerColor(marker.colorName, type),
      size: [MARKER_ICON_SIZE * w, MARKER_ICON_SIZE * h],
    },
    label: marker.text ? { text: marker.text, color: resolveTextColor(marker.colorName, type) } : undefined,
  };
};

// --------------- layers ---------------

const SIDES_WITH_CALLSIGNS: Side[] = ['West', 'East', 'Independent'];

const MapLayers = observer(() => {
  const world = mapsEntity.selectedMap?.config;
  const mission = missionEntity.data;
  const isAllNamesVisible = markersEntity.isPlayersNameVisible;

  // Per-unit label toggles (click on a unit), reset when "show names" changes.
  const [toggledUnits, setToggledUnits] = useState<Record<number, boolean>>({});
  useEffect(() => setToggledUnits({}), [isAllNamesVisible]);

  const renderer = useArmaMap();

  // SWT drawing tools: Ctrl+Alt+drag = line, Shift+Alt+drag = ellipse, Ctrl+click = quick marker.
  useEffect(() => {
    if (!renderer) return;

    const offDraw = renderer.on('drawShape', (shape) =>
      markersEntity.addMarker({
        id: generateRandomId(),
        data: [
          '',
          shape.center,
          shape.kind === 'line' ? -2 : -3,
          createMarkerEntity.currentColor,
          shape.direction,
          shape.size,
          '',
          [],
        ],
      })
    );

    const offQuick = renderer.on('quickMarker', (position) =>
      markersEntity.addMarker({
        id: generateRandomId(),
        data: [
          '',
          position,
          createMarkerEntity.currentType,
          createMarkerEntity.currentColor,
          0,
          createMarkerEntity.currentSize,
          '',
          [],
        ],
      })
    );

    return () => {
      offDraw();
      offQuick();
    };
  }, [renderer]);

  const drawColorName = markerColorNames[createMarkerEntity.currentColor];
  useEffect(() => {
    renderer?.setDrawColor(resolveShapeColor(drawColorName));
  }, [renderer, drawColorName]);

  // Locations: OCAP vector styles already contain place names.
  const locationItems = world?.maplibre ? [] : toLocationItems(mapsEntity.locations);

  // ---- units ----
  const unitItems: CanvasItem[] = [];

  const unitIcon = (side: Side) => ({
    url: '/markers/man.svg',
    color: getSideIconColor(side),
    size: [16, 16] as [number, number],
    originOffsetY: 0.1,
  });

  if (mission?.groups) {
    if (markersEntity.playersDisplayMode === 'players') {
      mission.groups.forEach((group) =>
        group.units.forEach((unit) => {
          const visible = Boolean(toggledUnits[unit.id]) !== isAllNamesVisible;
          unitItems.push({
            id: `unit-${unit.id}`,
            x: unit.position.coordinates.x,
            y: unit.position.coordinates.y,
            direction: radToDeg(unit.position.angles?.[1] ?? 0),
            icon: unitIcon(unit.side),
            label: visible
              ? { text: unit.description ?? unit.type, color: getSideLabelColor(unit.side), size: 12 }
              : undefined,
            interactive: true,
            onClick: () => setToggledUnits((prev) => ({ ...prev, [unit.id]: !prev[unit.id] })),
          });
        })
      );
    } else {
      SIDES_WITH_CALLSIGNS.forEach((side) => {
        mission.groups
          .filter((group) => group.side === side)
          .forEach((group: Group, index) => {
            const leader = group.units[0];
            if (!leader) return;
            const callsign = callsigns[index] ?? leader.description ?? leader.type;

            unitItems.push({
              id: `group-${group.id}`,
              x: leader.position.coordinates.x,
              y: leader.position.coordinates.y,
              direction: radToDeg(leader.position.angles?.[1] ?? 0),
              icon: unitIcon(side),
              label: { text: callsign, color: getSideLabelColor(side), size: 12, weight: 600 },
              interactive: true,
              onClick: () => {
                const list = group.units
                  .map((unit) => `<li>${escapeHtml(unit.description ?? unit.type)}</li>`)
                  .join('');
                renderer?.openPopup(
                  [leader.position.coordinates.x, leader.position.coordinates.y],
                  `<div class="apmo-popup-title">${escapeHtml(callsign)}</div><ol class="apmo-popup-list">${list}</ol>`
                );
              },
            });
          });
      });
    }
  }

  // ---- vehicles ----
  const vehicleItems: CanvasItem[] =
    mission?.vehicles?.map((vehicle) => {
      const icon = VEHICLE_ICONS[vehicle.type] ?? VEHICLE_ICONS.unknown;
      return {
        id: `vehicle-${vehicle.id}`,
        x: vehicle.position.coordinates.x,
        y: vehicle.position.coordinates.y,
        direction: radToDeg(vehicle.position.angles?.[1] ?? 0),
        icon: {
          url: icon.url,
          color: icon.tint ? EMPTY_VEHICLE_COLOR : null,
          size: [icon.size, icon.size],
        },
        interactive: true,
        onClick: () =>
          renderer?.openPopup(
            [vehicle.position.coordinates.x, vehicle.position.coordinates.y],
            escapeHtml(vehicle.description ?? vehicle.type)
          ),
      };
    }) ?? [];

  // ---- mission markers ----
  const missionShapes: ShapeItem[] = [];
  const missionIcons: CanvasItem[] = [];
  mission?.markers?.forEach((marker) => {
    if (isAreaMarker(marker)) {
      missionShapes.push(toMissionShape(marker));
    } else {
      const item = toMissionIcon(marker);
      if (item) missionIcons.push(item);
    }
  });

  // ---- plan (SWT) markers ----
  const swtShapes: ShapeItem[] = [];
  const swtIcons: CanvasItem[] = [];
  markersEntity.swtMarkers.forEach((marker) => {
    const type = getMarkerType(marker);
    if (type === 'ellipse' || type === 'line') swtShapes.push(toSwtShape(marker, type));
    else swtIcons.push(toSwtIcon(marker));
  });

  return (
    <>
      <ShapesLayer id="mission-shapes" items={missionShapes} />
      <ShapesLayer id="swt-shapes" items={swtShapes} />
      <CanvasItemsLayer id="locations" items={locationItems} zIndex={0} />
      <CanvasItemsLayer id="vehicles" items={vehicleItems} zIndex={10} />
      <CanvasItemsLayer id="mission-markers" items={missionIcons} zIndex={20} />
      <CanvasItemsLayer id="units" items={unitItems} zIndex={30} />
      <CanvasItemsLayer id="swt-markers" items={swtIcons} zIndex={40} />
    </>
  );
});

const HINT_KEYS = ['newMarker', 'quickMarker', 'line', 'ellipse', 'rotate', 'size', 'delete'] as const;

/** Sweet Markers shortcuts legend (bottom-left corner). */
const MapHints = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute left-2.5 bottom-2.5 z-[450] text-white text-xs select-none">
      {isOpen && (
        <ul className="mb-1 px-2.5 py-2 bg-black/70 border border-white/30 leading-5">
          {HINT_KEYS.map((key) => (
            <li key={key}>
              <Localize translationKey={`widgets:mapHints:${key}`} />
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="px-2 h-6 bg-black/70 border border-white/30 hover:bg-black/90 uppercase"
        onClick={() => setIsOpen((value) => !value)}
      >
        ? <Localize translationKey="widgets:mapHints:title" />
      </button>
    </div>
  );
};

const ArmaMap = observer(() => {
  const isMounted = useMounted();
  const world = mapsEntity.selectedMap?.config;

  if (!isMounted || !world) return null;

  const onDoubleClick = ([x, y]: [number, number], event: MouseEvent) => {
    if (markersEntity.isReadOnly) return;

    createMarkerEntity.open();
    createMarkerEntity.setMarkerPosition(x, y);
    createMarkerEntity.setControlsPosition(event.clientX, event.clientY);
  };

  return (
    <BasicMap
      world={world}
      interactive={!createMarkerEntity.isVisible}
      onDoubleClick={onDoubleClick}
      onZoomLevelChange={basicMapEntity.setZoomLevel}
    >
      <CreateMarker />
      <MapLayers />
      <MapHints />
    </BasicMap>
  );
});

export { ArmaMap };
