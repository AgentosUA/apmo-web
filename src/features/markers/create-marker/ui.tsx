'use client';

import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { useMap } from 'react-leaflet';

import {
  MarkersModel,
  SWTMarkerID,
  markersEntity as sharedMarkersEntity,
} from '@/entities/markers';
import {
  MarkerColor,
  MarkerType,
  markerColorNames,
  markerTypes,
} from '@/shared/data/marker';
import { Button } from '@/shared/ui/atoms/button';
import { MarkerIconComponent } from '@/shared/ui/atoms/marker';
import { getMarkerBackgroundColor } from '@/shared/ui/styles/marker-colors';
import { View } from '@/shared/ui/quarks/view';

import { CreateMarkerModel, createMarkerEntity } from './model';

const CreateMarker: FC<{
  model?: CreateMarkerModel;
  markersModel?: MarkersModel;
}> = observer(({ model = createMarkerEntity, markersModel }) => {
  const entity = model;
  const markersEntity = markersModel ?? sharedMarkersEntity;

  const map = useMap();

  useEffect(() => {
    const onEscapePress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        entity.close();
      }
    };

    const onEnterPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        markersEntity.addMarker({
          ...entity.marker,
        });

        entity.resetMarker();
        entity.close();
      }
    };

    if (entity.isVisible) {
      document.addEventListener('keydown', onEscapePress);
      document.addEventListener('keydown', onEnterPress);
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    }

    return () => {
      document.removeEventListener('keydown', onEscapePress);
      document.removeEventListener('keydown', onEnterPress);
      entity.closeAllList();
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    };
  }, [entity.isVisible]);

  if (!entity.isVisible) return null;

  return (
    <div className="absolute top-[30px] w-full h-full z-[400]">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[238px]"
        style={{
          top: entity.controlsPosition.y - 60,
          left: entity.controlsPosition.x + 150,
        }}
      >
        <div className="relative">
          <View.Condition if={entity.isAllListsVisible}>
            <div className="pl-2.5 w-11 h-[241px] overflow-y-auto bg-black/40 absolute left-[-185px] top-0">
              {markerColorNames.map((color, index) => (
                <div
                  key={index}
                  className="mx-auto w-6 h-6 cursor-pointer"
                  style={{ backgroundColor: getMarkerBackgroundColor(color) }}
                  onClick={() =>
                    entity.setMarkerColor(
                      MarkerColor[color as keyof typeof MarkerColor]
                    )
                  }
                />
              ))}
            </div>

            <div className="p-0 w-11 h-[241px] overflow-y-auto bg-black/40 absolute left-[-122px] top-0 [&_img]:mx-auto [&_img]:flex [&_img]:flex-col [&_img]:items-center [&_img]:justify-center [&_img]:flex-nowrap">
              {markerTypes.map((markerType) => (
                <MarkerIconComponent
                  key={markerType}
                  width={24}
                  height={24}
                  onClick={() => {
                    entity.setMarkerType(
                      MarkerType[markerType as keyof typeof MarkerType]
                    );
                  }}
                  className="cursor-pointer"
                  markerName={markerType}
                  color={markerColorNames[MarkerColor.ColorWhite]}
                />
              ))}
            </div>
          </View.Condition>
          <MarkerIconComponent
            width={32}
            height={32}
            className="absolute top-[78px] left-[-46px] cursor-pointer"
            markerName={markerTypes[entity.marker.data[SWTMarkerID.type]]}
            color={markerColorNames[entity.marker.data[SWTMarkerID.color]]}
            onClick={entity.switchAllListsVisibility}
          />

          <div className="flex flex-nowrap w-full mb-[5px]">
            {entity.defaultSWTMarkers.map((markerType) => (
              <MarkerIconComponent
                key={markerType}
                width={39}
                height={39}
                onClick={() => entity.setMarkerType(markerType)}
                className="cursor-pointer"
                markerName={markerTypes[markerType]}
                color={markerColorNames[entity.marker.data[SWTMarkerID.color]]}
              />
            ))}
          </div>

          <div className="flex flex-nowrap w-full">
            {entity.defaultSWTColors.map((markerColor) => (
              <div
                key={markerColor}
                onClick={() => entity.setMarkerColor(markerColor)}
                className="w-full h-4 opacity-70 cursor-pointer"
                style={{
                  backgroundColor: getMarkerBackgroundColor(
                    markerColorNames[markerColor]
                  ),
                }}
              />
            ))}
          </div>

          <div className="pl-[7px] h-[23px] text-sm font-medium leading-[23px] text-[#46D2FB] bg-a3-surface pointer-events-none">
            Side Channel
          </div>

          <input
            autoFocus
            className="w-full h-[30px] px-[7px] text-white text-sm font-normal shadow-none outline-none border-none font-[var(--font-roboto),Tahoma,sans-serif] bg-a3-surface"
            value={entity.marker.data[SWTMarkerID.text]}
            onChange={(e) => entity.setMarkerText(e.target.value)}
            placeholder=""
            alt="input"
          />
          <div className="mt-0.5 flex items-center max-w-[238px] gap-[5px] [&_button]:min-w-0 [&_button]:w-full">
            <Button
              onClick={() => {
                markersEntity.addMarker({
                  ...entity.marker,
                });

                entity.resetMarker();
                entity.close();
              }}
            >
              OK
            </Button>
            <Button
              onClick={() => {
                entity.resetMarker();
                entity.close();
              }}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export { CreateMarker };
