import { Marker } from '@/entities/markers';
import { MarkerColor, MarkerType } from '@/shared/data/marker';
import { generateRandomId } from '@/shared/utils/string';

const generateNewMarker = (): Marker =>
  ({
    id: generateRandomId(),
    data: ['', [0, 0], MarkerType.mil_dot, MarkerColor.ColorBlue, 0, 1, '', []],
  } as Marker);

export { generateNewMarker };
