import { Marker } from '@/entities/markers';
import { MarkerColor, MarkerType } from '@/shared/data/marker';
import { generateRandomId } from '@/shared/utils/string';

const generateNewMarker = (
  type: number = MarkerType.mil_dot,
  color: number = MarkerColor.ColorBlue,
  size: number = 1
): Marker =>
  ({
    id: generateRandomId(),
    data: ['', [0, 0], type, color, 0, size, '', []],
  } as Marker);

export { generateNewMarker };
