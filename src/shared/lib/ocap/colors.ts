/**
 * Arma marker / side colors.
 *
 * Named marker colors follow OCAP2/web `RepoMarker.scanColor()`
 * (internal/server/marker.go); side colors follow `config/sideColors.ts`.
 * The "Firing Drills" palette (Color*_FD_F) is not in OCAP and keeps the
 * values from Arma's CfgMarkerColors.
 */

/** Lower-case color name without the "color" prefix → hex (no '#'). */
const NAMED_COLORS: Record<string, string> = {
  follow: 'ffa81a',
  hit: 'ff0000',
  dead: '000000',
  black: '000000',
  grey: '7f7f7f',
  red: 'ff0000',
  brown: '7f3f00',
  orange: 'd86600',
  yellow: 'd9d900',
  khaki: '7f9966',
  green: '00cc00',
  blue: '0000ff',
  pink: 'ff4c66',
  white: 'ffffff',
  unknown: 'b29900',
  blufor: '004c99',
  west: '004c99',
  opfor: '7f0000',
  east: '7f0000',
  ind: '007f00',
  independent: '007f00',
  guer: '007f00',
  civ: '66007f',
  civilian: '66007f',
  unconscious: 'ffa81a',
  // Firing Drills palette (CfgMarkerColors)
  '1_fd_f': 'b13339',
  '2_fd_f': 'adbfb3',
  '3_fd_f': 'f08231',
  '4_fd_f': '678b9b',
  '5_fd_f': 'b040a7',
  '6_fd_f': '5a595a',
};

const normalizeColorName = (name: string) =>
  name.trim().toLowerCase().replace(/^color/, '');

/**
 * Arma "Default" means "the marker class' own color". In CfgMarkers that is:
 * black for mil_ / hd_ / respawn_ icons, the side color for NATO icons and
 * the native image colors (no tint) for flags and textured icons.
 */
const getDefaultColorForType = (markerType = ''): string | null => {
  const type = markerType.toLowerCase();

  if (/^(mil|hd|respawn|loc|lib_mil|lib_hd)_/.test(type)) return NAMED_COLORS.black;
  if (/^(b|lib_b|vk_b)_/.test(type)) return NAMED_COLORS.blufor;
  if (/^(o|lib_o|vk_o)_/.test(type)) return NAMED_COLORS.opfor;
  if (/^(n|lib_n|vk_n)_/.test(type)) return NAMED_COLORS.ind;
  if (/^c_/.test(type)) return NAMED_COLORS.civ;
  if (/^(u|vk_u)_/.test(type)) return NAMED_COLORS.unknown;

  return null;
};

/**
 * Resolve an Arma color name ("ColorRed", "colorBLUFOR", "Default", "ff00aa")
 * to a 6-digit hex without '#'. Returns `null` when the icon must be drawn
 * with its native colors.
 */
const resolveMarkerColor = (colorName?: string | null, markerType?: string): string | null => {
  if (!colorName) return getDefaultColorForType(markerType);

  if (/^#?[0-9a-f]{6}$/i.test(colorName)) return colorName.replace('#', '').toLowerCase();

  const name = normalizeColorName(colorName);
  if (name === 'default' || name === '') return getDefaultColorForType(markerType);

  return NAMED_COLORS[name] ?? getDefaultColorForType(markerType);
};

/** Color for shapes (ellipse / rectangle / lines). "Default" is black in Arma. */
const resolveShapeColor = (colorName?: string | null) =>
  resolveMarkerColor(colorName, 'mil_') ?? NAMED_COLORS.black;

/** CSS color for marker text. Arma draws marker text in the marker color. */
const resolveTextColor = (colorName?: string | null, markerType?: string) =>
  `#${resolveMarkerColor(colorName, markerType) ?? NAMED_COLORS.black}`;

type ArmaSide = 'West' | 'East' | 'Independent' | 'Civilian' | 'Unknown';

/** Dark side colors used for unit icons (OCAP SIDE_COLORS_DARK). */
const SIDE_ICON_COLORS: Record<ArmaSide, string> = {
  West: '004d99',
  East: '800000',
  Independent: '007f00',
  Civilian: '650080',
  Unknown: 'b29900',
};

/** Bright side colors used for unit labels (OCAP SIDE_COLORS_BRIGHT). */
const SIDE_LABEL_COLORS: Record<ArmaSide, string> = {
  West: '#00a8ff',
  East: '#ff0000',
  Independent: '#00cc00',
  Civilian: '#c900ff',
  Unknown: '#b29900',
};

const getSideIconColor = (side?: string) =>
  SIDE_ICON_COLORS[(side as ArmaSide) ?? 'Unknown'] ?? SIDE_ICON_COLORS.Unknown;

const getSideLabelColor = (side?: string) =>
  SIDE_LABEL_COLORS[(side as ArmaSide) ?? 'Unknown'] ?? SIDE_LABEL_COLORS.Unknown;

export {
  NAMED_COLORS,
  getDefaultColorForType,
  resolveMarkerColor,
  resolveShapeColor,
  resolveTextColor,
  getSideIconColor,
  getSideLabelColor,
};

export type { ArmaSide };
