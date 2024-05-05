import { Vehicle } from '@/entities/mission/types';

const getVehicleIconSizeByType = (vehicle: Vehicle) => {
  switch (vehicle.type) {
    case 'crate':
      return 16;
    case 'unknown':
      return 20;
    default:
      return 32;
  }
};

export { getVehicleIconSizeByType };
