import { MarkerColorHEX } from '@/shared/data/marker';

const MARKER_FILTERS: Record<string, string> = {
  Default: '',
  ColorBlackFilter:
    'brightness(0) saturate(100%) invert(0%) sepia(85%) saturate(7500%) hue-rotate(291deg) brightness(89%) contrast(89%)',
  ColorGreyFilter:
    'opacity(1) brightness(0) saturate(100%) invert(55%) sepia(0%) saturate(222%) hue-rotate(1deg) brightness(91%) contrast(90%)',
  ColorRedFilter:
    'opacity(1) invert(51%) sepia(32%) saturate(6988%) hue-rotate(348deg) brightness(83%) contrast(172%)',
  ColorBrownFilter:
    'brightness(0) saturate(100%) invert(20%) sepia(72%) saturate(1835%) hue-rotate(336deg) brightness(98%) contrast(97%)',
  ColorOrangeFilter:
    'brightness(0) saturate(100%) invert(57%) sepia(98%) saturate(792%) hue-rotate(360deg) brightness(102%) contrast(102%)',
  ColorYellowFilter:
    'brightness(0) saturate(100%) invert(87%) sepia(84%) saturate(755%) hue-rotate(359deg) brightness(107%) contrast(100%)',
  ColorKhakiFilter:
    'brightness(0) saturate(100%) invert(93%) sepia(35%) saturate(547%) hue-rotate(343deg) brightness(97%) contrast(94%)',
  ColorGreenFilter:
    'brightness(0) saturate(100%) invert(26%) sepia(94%) saturate(3048%) hue-rotate(91deg) brightness(92%) contrast(106%)',
  ColorBlueFilter:
    'brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7476%) hue-rotate(248deg) brightness(91%) contrast(144%)',
  ColorPinkFilter:
    'brightness(0) saturate(30%) invert(85%) sepia(14%) saturate(1555%) hue-rotate(297deg) brightness(101%) contrast(103%)',
  ColorWhiteFilter:
    'brightness(0) saturate(100%) invert(100%) sepia(39%) saturate(0%) hue-rotate(108deg) brightness(106%) contrast(100%)',
  ColorWESTFilter:
    'brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(7468%) hue-rotate(248deg) brightness(95%) contrast(142%)',
  ColorEASTFilter:
    'brightness(0) saturate(100%) invert(11%) sepia(80%) saturate(7235%) hue-rotate(359deg) brightness(102%) contrast(107%)',
  ColorGUERFilter:
    'brightness(0) saturate(100%) invert(20%) sepia(96%) saturate(3805%) hue-rotate(112deg) brightness(93%) contrast(105%)',
  ColorCIVFilter:
    'brightness(0) saturate(100%) invert(57%) sepia(96%) saturate(938%) hue-rotate(360deg) brightness(102%) contrast(105%)',
  ColorUNKNOWNFilter:
    'brightness(0) saturate(100%) invert(53%) sepia(1%) saturate(240%) hue-rotate(314deg) brightness(95%) contrast(82%)',
  colorBLUFORFilter:
    'brightness(0) saturate(100%) invert(13%) sepia(87%) saturate(4381%) hue-rotate(243deg) brightness(97%) contrast(161%)',
  colorOPFORFilter:
    'brightness(0) saturate(100%) invert(27%) sepia(88%) saturate(7467%) hue-rotate(357deg) brightness(95%) contrast(122%)',
  colorIndependentFilter:
    'brightness(0) saturate(100%) invert(26%) sepia(94%) saturate(3048%) hue-rotate(91deg) brightness(92%) contrast(106%)',
  colorCivilianFilter:
    'brightness(0) saturate(100%) invert(81%) sepia(49%) saturate(6239%) hue-rotate(3deg) brightness(107%) contrast(104%)',
  Color1_FD_FFilter:
    'brightness(0) saturate(100%) invert(15%) sepia(97%) saturate(7069%) hue-rotate(1deg) brightness(93%) contrast(118%)',
  Color2_FD_FFilter:
    'brightness(0) saturate(100%) invert(54%) sepia(24%) saturate(461%) hue-rotate(154deg) brightness(92%) contrast(89%)',
  Color3_FD_FFilter:
    'brightness(0) saturate(100%) invert(29%) sepia(75%) saturate(1564%) hue-rotate(92deg) brightness(93%) contrast(107%)',
  Color4_FD_FFilter:
    'brightness(0) saturate(100%) invert(62%) sepia(99%) saturate(1777%) hue-rotate(0deg) brightness(103%) contrast(104%)',
  Color5_FD_FFilter:
    'brightness(0) saturate(100%) invert(38%) sepia(32%) saturate(1748%) hue-rotate(262deg) brightness(87%) contrast(96%)',
  Color6_FD_FFilter:
    'brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(7471%) hue-rotate(248deg) brightness(101%) contrast(144%)',
  East: 'opacity(1) invert(51%) sepia(32%) saturate(6988%) hue-rotate(348deg) brightness(83%) contrast(172%)',
  Independent:
    'brightness(0) saturate(100%) invert(26%) sepia(94%) saturate(3048%) hue-rotate(91deg) brightness(92%) contrast(106%)',
  West: 'brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7476%) hue-rotate(248deg) brightness(91%) contrast(144%)',
};

const getMarkerFilter = (color: string): string | undefined => {
  const key = color.endsWith('Filter') ? color : `${color}Filter`;
  const filter = MARKER_FILTERS[key] ?? MARKER_FILTERS[color];
  return filter || undefined;
};

const getMarkerFilterClass = (color: string): string | undefined => {
  const filter = getMarkerFilter(color);
  if (!filter) return undefined;
  return `marker-filter-${color.replace(/Filter$/, '')}`;
};

const getMarkerTextColor = (color: string): string | undefined => {
  return MarkerColorHEX[color as keyof typeof MarkerColorHEX];
};

const getMarkerBackgroundColor = (color: string): string | undefined => {
  return MarkerColorHEX[color as keyof typeof MarkerColorHEX];
};

const MARKER_TOOLTIP_BASE =
  'p-0 top-0 left-[18px] !font-normal !text-base !shadow-none !border-none !bg-transparent [text-shadow:1px_1px_1px_rgba(0,0,0,0.7)]';

const LOCATION_TYPE_CLASSES: Record<string, string> = {
  capital: '!text-lg',
  city: '!text-sm',
  village: '!text-xs',
  local: '!text-[10px]',
  rockarea: '!text-[10px]',
  marine: '!text-[10px] !text-[rgb(0,98,245)]',
  hill: '!text-[10px]',
};

const SIDE_TEXT_CLASSES: Record<string, string> = {
  westtext: '!text-[rgb(0,98,245)]',
  easttext: '!text-[rgb(255,0,0)]',
  independenttext: '!text-[rgb(13,145,13)]',
};

export {
  getMarkerBackgroundColor,
  getMarkerFilter,
  getMarkerFilterClass,
  getMarkerTextColor,
  LOCATION_TYPE_CLASSES,
  MARKER_TOOLTIP_BASE,
  SIDE_TEXT_CLASSES,
};
