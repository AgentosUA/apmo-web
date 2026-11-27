/**
 * Picks an OCAP2 entity icon (public/markers/<type>.svg, borrowed from
 * https://github.com/OCAP2/web assets/markers/ocap, MIT) for a mission vehicle.
 *
 * The mission parser gives only a coarse type (land / air / static / crate /
 * unknown), so the concrete icon is guessed from the vehicle's class name
 * (`description`), e.g. `B_MBT_01_cannon_F`, `rhs_bmp2_msv`, `CUP_O_Ural_RU`.
 */
import type { Vehicle } from '@/entities/mission/types';

type VehicleIconType =
  'car' | 'truck' | 'apc' | 'tank' | 'heli' | 'plane' | 'ship' | 'parachute' | 'unknown';

/** Draw size in px, same proportions as OCAP. */
const VEHICLE_ICON_SIZES: Record<VehicleIconType, number> = {
  car: 24,
  truck: 28,
  apc: 28,
  tank: 28,
  heli: 32,
  plane: 32,
  ship: 28,
  parachute: 20,
  unknown: 24,
};

/**
 * Rules run against the class name lower-cased with `_` / `-` turned into
 * spaces ("rhs_t72ba_tv" → "rhs t72ba tv"), so `\b` works on its parts.
 * Order matters: the first match wins.
 */
const VEHICLE_ICON_RULES: [VehicleIconType, RegExp][] = [
  ['parachute', /parachute|steerable|\bpara\b/],
  [
    'plane',
    /plane|\bjet\b|\buav (02|05)\b|wipeout|neophron|buzzard|gryphon|shikra|wasp|blackfish|vtol|caesar|xian|\bc ?130|\ba ?10\b|\bsu ?(25|27|30|34|35|57)|\bmig|\bf ?(4|5|14|15|16|18|22|35)\b|\bf\d{2}[a-z]|\ban ?2\b|\byak|\bl ?39|\bav8|harrier|\bt ?50\b|\bpchela/,
  ],
  [
    'heli',
    /heli|\buav (01|06)\b|hummingbird|pawnee|kajman|orca|huron|mohawk|taru|hellcat|wildcat|blackfoot|ghosthawk|\bmh ?6|\bah ?(1|6|64)|\buh ?(1|60)|\bch ?(47|53)|\bmh ?(47|60)|\bmi ?\d|\bka ?\d|\bmelb|\blittlebird|\bsa330|\bpuma|\bmerlin|\blynx/,
  ],
  ['ship', /boat|ship|rhib|speedboat|submarine|\bsdv\b|destroyer|carrier|\bpbr\b|\bnaval/],
  [
    'tank',
    /tank|\bmbt\b|\blt\b|slammer|varsuk|kuma|angara|\bnyx|rhino|\bt ?(34|55|62|64|72|80|90|14)|abrams|\bm1a\d|leopard|challenger|\bm60\b|\bsprut|\bzsu|\bt ?80/,
  ],
  [
    'apc',
    /\bapc\b|\bifv\b|\bafv\b|marshall|marid|gorgon|panther|kamysh|mora|cheetah|tigris|bobcat|\bb[mt]p ?\d|\bbm[dp]\b|\bbmd ?\d|\bbtr|\bbrdm|\bmtlb|bradley|\bm2a\d|stryker|\bm113|\blav|\bm1126|\bm1128|\bm1129|\bm1130|\bm1132|\bm1133|\bm1134|\bm1135|\baav|\bpatria|\bboxer|\bwarrior|\bbvp/,
  ],
  [
    'truck',
    /truck|zamak|hemtt|tempest|\bvan\b|\bural|\bkamaz|\bkraz|\bzil|\bmtvr|\bfmtv|\bm939|\bm97[78]|\bm10(78|83)|\bm1120|\bgaz ?66|\bv3s\b|\btatra|\bmaz\b/,
  ],
  [
    'car',
    /\bcar\b|mrap|hunter|ifrit|strider|offroad|quad|kart|prowler|qilin|hatchback|\bsuv\b|jeep|hmmwv|humvee|\bm(998|1025|1043|1045|1097|1151|1152|1165|1232|1240|1220)\b|\bmatv|\buaz|\bgaz|\blada|tigr|land ?rover|motorcycle|\bbike|\bugv|tractor|\bsedan|\bpickup|\bhilux|\bdatsun|\bskoda|\bvolha|\bilv\b/,
  ],
];

const normalize = (className: string) => className.toLowerCase().replace(/[_\-\s]+/g, ' ');

const getVehicleIconType = (vehicle: Pick<Vehicle, 'type' | 'description'>): VehicleIconType => {
  const text = normalize(vehicle.description ?? '');
  const match = VEHICLE_ICON_RULES.find(([, rule]) => rule.test(text));
  if (match) return match[0];

  switch (vehicle.type) {
    case 'air':
      return 'heli';
    case 'land':
      return 'car';
    default:
      return 'unknown';
  }
};

const getVehicleIconUrl = (type: VehicleIconType) => `/markers/${type}.svg`;

export { getVehicleIconType, getVehicleIconUrl, VEHICLE_ICON_SIZES };
export type { VehicleIconType };
