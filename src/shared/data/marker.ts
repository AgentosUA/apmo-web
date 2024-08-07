enum MarkerType {
  'empty_ca',
  'mil_objective', // mil_objective
  'mil_marker',
  'mil_flag',
  'mil_arrow',
  'mil_arrow2',
  'mil_ambush',
  'mil_destroy',
  'mil_start',
  'mil_end',
  'mil_pickup',
  'mil_join',
  'mil_warning',
  'mil_unknown',
  'mil_circle',
  'mil_dot',
  'mil_box',
  'mil_triangle',
  'hd_dot',
  'hd_objective',
  'hd_flag',
  'hd_arrow',
  'hd_ambush',
  'hd_destroy',
  'hd_start',
  'hd_end',
  'hd_pickup',
  'hd_join',
  'hd_warning',
  'hd_unknown',
  'b_unknown',
  'o_unknown',
  'n_unknown',
  'b_inf',
  'o_inf',
  'n_inf',
  'b_motor_inf',
  'o_motor_inf',
  'n_motor_inf',
  'b_mech_inf',
  'o_mech_inf',
  'n_mech_inf',
  'b_armor',
  'o_armor',
  'n_armor',
  'b_recon',
  'o_recon',
  'n_recon',
  'b_air',
  'o_air',
  'n_air',
  'b_plane',
  'o_plane',
  'n_plane',
  'b_uav',
  'o_uav',
  'n_uav',
  'b_naval',
  'o_naval',
  'n_naval',
  'b_med',
  'o_med',
  'n_med',
  'b_art',
  'o_art',
  'n_art',
  'b_mortar',
  'o_mortar',
  'n_mortar',
  'b_hq',
  'o_hq',
  'n_hq',
  'b_support',
  'o_support',
  'n_support',
  'b_maint',
  'o_maint',
  'n_maint',
  'b_service',
  'o_service',
  'n_service',
  'b_installation',
  'o_installation',
  'n_installation',
  'u_installation',
  'b_antiair',
  'o_antiair',
  'n_antiair',
  'c_unknown',
  'c_car',
  'c_ship',
  'c_air',
  'c_plane',
  'respawn_unknown',
  'respawn_inf',
  'respawn_motor',
  'respawn_armor',
  'respawn_air',
  'respawn_plane',
  'respawn_naval',
  'respawn_para',
  // 'Select',
  // 'waypoint',
  // 'selector_selectable',
  // 'selector_selectedEnemy',
  // 'selector_selectedFriendly',
  // 'selector_selectedMission',
  // 'KIA',
  // 'Minefield',
  // 'MinefieldAP',
  // 'b_Ordnance',
  // 'o_Ordnance',
  // 'n_Ordnance',
}

enum MarkerColor {
  'Default',
  'ColorBlack',
  'ColorGrey',
  'ColorRed',
  'ColorBrown',
  'ColorOrange',
  'ColorYellow',
  'ColorKhaki',
  'ColorGreen',
  'ColorBlue',
  'ColorPink',
  'ColorWhite',
  'ColorWEST',
  'ColorEAST',
  'ColorGUER',
  'ColorCIV',
  'ColorUNKNOWN',
  'colorBLUFOR',
  'colorOPFOR',
  'colorIndependent',
  'colorCivilian',
  'Color1_FD_F',
  'Color2_FD_F',
  'Color3_FD_F',
  'Color4_FD_F',
  'Color5_FD_F',
  'Color6_FD_F',
}

enum MarkerColorHEX {
  Default = '#fff',
  ColorDefault = '#000000',
  ColorBlack = '#000000',
  ColorGrey = '#808080',
  ColorRed = '#E60000',
  ColorBrown = '#804000',
  ColorOrange = '#D96600',
  ColorYellow = '#D9D900',
  ColorKhaki = '#809966',
  ColorGreen = '#00CC00',
  ColorBlue = '#0000FF',
  ColorPink = '#FF4D66',
  ColorWhite = '#FFFFFF',
  ColorWEST = '#004D99',
  ColorEAST = '#800000',
  ColorGUER = '#008000',
  ColorCIV = '#660080',
  ColorUNKNOWN = '#B39900',
  colorBLUFOR = '#004D99',
  colorOPFOR = '#800000',
  colorIndependent = '#008000',
  colorCivilian = '#660080',
  Color1_FD_F = '#B13339',
  Color2_FD_F = '#ADBFB3',
  Color3_FD_F = '#F08231',
  Color4_FD_F = '#678B9B',
  Color5_FD_F = '#B040A7',
  Color6_FD_F = '#5A595A',
}

const markerTypes = Object.keys(MarkerType).filter((key) =>
  isNaN(Number(key))
) as string[];

const markerColorNames = Object.keys(MarkerColor).filter((key) =>
  isNaN(Number(key))
) as string[];

export {
  markerTypes,
  markerColorNames,
  MarkerColor,
  MarkerType,
  MarkerColorHEX,
};
