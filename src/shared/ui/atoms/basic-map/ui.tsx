'use client';

import { reaction } from 'mobx';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { CanvasItem } from '@/shared/lib/ocap/canvas-layer';
import type { ArmaCoord } from '@/shared/lib/ocap/coordinates';
import { ArmaMapRenderer } from '@/shared/lib/ocap/renderer';
import type { ShapeItem } from '@/shared/lib/ocap/shapes';
import type { WorldConfig } from '@/shared/lib/ocap/worlds';
import { cn } from '@/shared/utils/cn';

import { basicMapEntity } from './model';

const ArmaMapContext = createContext<ArmaMapRenderer | null>(null);

/** Access the imperative map renderer from a child of <BasicMap>. */
const useArmaMap = () => useContext(ArmaMapContext);

/** Push a list of canvas icons/labels into a named layer. */
const CanvasItemsLayer: FC<{ id: string; items: CanvasItem[]; zIndex?: number }> = ({
  id,
  items,
  zIndex = 0,
}) => {
  const renderer = useArmaMap();

  useEffect(() => {
    renderer?.setItems(id, items, zIndex);
  }, [renderer, id, items, zIndex]);

  useEffect(() => () => renderer?.removeItems(id), [renderer, id]);

  return null;
};

/** Push a list of area markers (ellipses / rectangles / lines) into a named layer. */
const ShapesLayer: FC<{ id: string; items: ShapeItem[] }> = ({ id, items }) => {
  const renderer = useArmaMap();

  useEffect(() => {
    renderer?.setShapes(id, items);
  }, [renderer, id, items]);

  useEffect(() => () => renderer?.setShapes(id, []), [renderer, id]);

  return null;
};

const BasicMap: FC<
  PropsWithChildren<{
    className?: string;
    world: WorldConfig;
    interactive?: boolean;
    onDoubleClick?: (position: ArmaCoord, event: MouseEvent) => void;
    onZoomLevelChange?: (zoomLevel: number) => void;
  }>
> = ({ className, children, world, interactive = true, onDoubleClick, onZoomLevelChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<ArmaMapRenderer | null>(null);

  const handlersRef = useRef({ onDoubleClick, onZoomLevelChange });
  handlersRef.current = { onDoubleClick, onZoomLevelChange };

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new ArmaMapRenderer(containerRef.current, world);
    const offDblClick = instance.on('dblclick', (position, event) =>
      handlersRef.current.onDoubleClick?.(position, event)
    );
    const offZoom = instance.on('zoom', (zoom) => handlersRef.current.onZoomLevelChange?.(zoom));
    handlersRef.current.onZoomLevelChange?.(instance.getZoom());

    // Fly to requested Arma coordinates (slot list, etc.).
    const disposeFly = reaction(
      () => basicMapEntity.flyCoordinates,
      ({ x, y }) => {
        if (!x && !y) return;
        instance.flyTo([x, y]);
      }
    );

    setRenderer(instance);

    return () => {
      disposeFly();
      offDblClick();
      offZoom();
      instance.dispose();
      setRenderer(null);
    };
    // Re-create the map only when the world changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world.worldName, world.tileBaseUrl]);

  useEffect(() => {
    renderer?.setInteractive(interactive);
  }, [renderer, interactive]);

  return (
    <div id="map" className="relative">
      <div
        ref={containerRef}
        className={cn('isolate min-h-screen max-h-screen h-screen w-full overflow-hidden bg-[#3C3C3C]', className)}
      />
      <ArmaMapContext.Provider value={renderer}>{renderer && children}</ArmaMapContext.Provider>
    </div>
  );
};

export { BasicMap, CanvasItemsLayer, ShapesLayer, useArmaMap };
