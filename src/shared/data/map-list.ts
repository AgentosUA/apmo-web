const mapList = [
  {
    id: 'reshmaan',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Reshmaan Province',
    dir: 'reshmaan',
    image: '/maps/reshmaan.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'chernarus',
    width: '15360',
    height: '15360',
    offset: '300',
    zoom: '7',
    name: 'Chernarus Autumn',
    dir: 'chernarus',
    image: '/maps/chernarus.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'utes',
    width: '5120',
    height: '5120',
    offset: '300',
    zoom: '8',
    name: 'Utes',
    dir: 'utes',
    image: '/maps/utes.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'shapur',
    width: '2048',
    height: '2048',
    offset: '300',
    zoom: '5',
    name: 'Shapur',
    dir: 'shapur_baf',
    image: '/maps/shapur.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'schwemlitz',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Schwemlitz',
  //   dir: 'schwemlitz',
  //   image: 'no-island.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'takistan',
    width: '12800',
    height: '12800',
    offset: '300',
    zoom: '8',
    name: 'Takistan',
    dir: 'takistan',
    image: '/maps/takistan.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'mountains_acr',
  //   width: '12800',
  //   height: '12800',
  //   offset: '300',
  //   zoom: '6',
  //   name: 'Takistan Mountains',
  //   dir: 'mountains_acr',
  //   image: '/maps/takistan.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'provinggrounds_pmc',
    width: '2048',
    height: '2048',
    offset: '300',
    zoom: '5',
    name: 'Proving Grounds',
    dir: 'provinggrounds_pmc',
    image: '/maps/proving_grounds.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'mbg_celle2',
    width: '12294',
    height: '12300',
    offset: '300',
    zoom: '7',
    name: 'Celle 2',
    dir: 'mbg_celle2',
    image: '/maps/celle2.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'isoladicapraia',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'Isola di Capraia',
    dir: 'isoladicapraia',
    merged: true,
    image: '/maps/capraia.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'thirsk',
  //   width: '5120',
  //   height: '5120',
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Thirsk Winter',
  //   dir: 'thirsk',
  //   image: '/maps/thirsk.png',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'fdf_isle1_a',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '7',
    name: 'Podagorsk',
    dir: 'fdf_isle1_a',
    image: '/maps/podagorsk.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'caribou',
    width: '8192',
    height: '8192',
    offset: '300',
    zoom: '7',
    name: 'Caribou Frontier',
    dir: 'caribou',
    image: '/maps/caribou.png',
    merged: true,
    author: 'Bohemia Interactive',
  },
  {
    id: 'fallujah',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'Fallujah',
    dir: 'fallujah',
    image: '/maps/fallujah.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'desert_e',
    width: '2048',
    height: '2048',
    offset: '300',
    zoom: '5',
    name: 'Desert',
    dir: 'desert_e',
    image: '/maps/desert.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'zargabad',
    width: '8192',
    height: '8192',
    offset: '300',
    zoom: '7',
    name: 'Zargabad',
    dir: 'zargabad',
    image: '/maps/zargabad.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'sara',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Sahrani',
    dir: 'sara',
    image: '/maps/sahrani.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'schwemlitz',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Schwemlitz Winter',
  //   dir: 'schwemlitz',
  //   image: '/maps/schwemlitz.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'thirsk',
  //   width: '5120',
  //   height: '5120',
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Thirsk',
  //   dir: 'thirsk',
  //   image: '/maps/thirsk.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'torabora',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Torabora',
  //   dir: 'torabora',
  //   image: '/maps/torabora.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'clafghan',
  //   width: '20480',
  //   height: '20480',
  //   offset: '300',
  //   zoom: '9',
  //   name: 'Clafghan',
  //   dir: 'clafghan',
  //   image: '/maps/clafghan.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'aliabad',
  //   width: '5120',
  //   height: '5120',
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Aliabad Region',
  //   dir: 'aliabad',
  //   image: '/maps/aliabad.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'fata',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'FATA, Pakistan',
    dir: 'fata',
    image: '/maps/fata.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'beketov',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Beketov',
    dir: 'beketov',
    image: '/maps/beketov.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'woodland_acr',
    width: '7680',
    height: '7680',
    offset: '300',
    zoom: '6',
    name: 'Bystrica',
    dir: 'woodland_acr',
    image: '/maps/bystrica.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'chernarus_winter',
    width: '15360',
    height: '15360',
    offset: '300',
    zoom: '7',
    name: 'Chernarus Winter',
    dir: 'chernarus',
    image: '/maps/chernarus.jpg',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'namalsk',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Namalsk',
  //   dir: 'namalsk',
  //   image: '/maps/namalsk.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'emita',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Emita',
  //   dir: 'emita',
  //   image: '/maps/emita.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'fayshkhabur',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Fayshkhabur',
  //   dir: 'fayshkhabur',
  //   image: '/maps/fayshkhabur.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'napf',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Napf',
    dir: 'napf',
    merged: true,
    image: '/maps/napf.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'afgani',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Afgani Village',
  //   dir: 'afgani',
  //   image: '/maps/afgani.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'wogisland2',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'WOG Island №2',
  //   dir: 'wogisland2',
  //   image: '/maps/wogisland2.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'altis',
    width: '30720',
    height: '30720',
    offset: '300',
    zoom: '8',
    name: 'Altis',
    dir: 'altis',
    image: '/maps/altis.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'chernarus_summer',
    width: '15360',
    height: '15360',
    offset: '300',
    zoom: '7',
    name: 'Chernarus Summer',
    dir: 'chernarus',
    image: '/maps/chernarus.jpg',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'isladuala3',
  //   width: '10240',
  //   height: '10240',
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Isla Duala',
  //   dir: 'isladuala3',
  //   image: '/maps/isladuala3.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'malden',
    width: '12800',
    height: '12800',
    offset: '300',
    zoom: '7',
    name: 'Malden',
    dir: 'malden',
    image: '/maps/malden.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'mountains-acr',
  //   width: '6400',
  //   height: '11820',
  //   offset: '300',
  //   zoom: '9',
  //   name: 'Mountains ACR',
  //   dir: 'mountains-acr',
  //   image: '/maps/mountains-acr.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'napfwinter',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Napf Winter',
    dir: 'napf',
    merged: true,
    image: '/maps/napf.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'porto',
    width: '5120',
    height: '5120',
    offset: '300',
    zoom: '6',
    name: 'Porto',
    dir: 'porto',
    image: '/maps/porto.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'sahranilite',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'Sahrani (Southern)',
    dir: 'saralite',
    image: '/maps/sahrani-southern.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'sara_dbe1',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Sahrani (United Sahrani)',
    dir: 'sara',
    image: '/maps/sahrani.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'stratis',
    width: '8192',
    height: '8192',
    offset: '300',
    zoom: '7',
    name: 'Stratis',
    dir: 'stratis',
    image: '/maps/stratis.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'tanoa',
    width: '15360',
    height: '15360',
    offset: '300',
    zoom: '7',
    name: 'Tanoa',
    dir: 'tanoa',
    image: '/maps/tanoa.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'abramia',
  //   width: '10240',
  //   height: '10240',
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Abramia',
  //   dir: 'abramia',
  //   image: '/maps/abramia.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'lythium',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Lythium',
    dir: 'lythium',
    image: '/maps/lythium.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'utes_winter',
  //   width: '5120',
  //   height: '5120',
  //   offset: '300',
  //   zoom: '6',
  //   name: 'Utes Winter',
  //   dir: 'utes',
  //   image: '/maps/utes.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'tembelan',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Tembelan',
  //   dir: 'tembelan',
  //   image: '/maps/tembelan.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'hellanmaa',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Hellanmaa',
  //   dir: 'hellanmaa',
  //   image: '/maps/hellanmaa.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'Sennoe',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '8',
  //   name: 'Sennoe',
  //   dir: 'Sennoe',
  //   image: '/maps/Sennoe.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'lingor3',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'Lingor',
    dir: 'lingor3',
    image: '/maps/lingor.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'ruha',
    width: '8192',
    height: '8192',
    offset: '300',
    zoom: '7',
    name: 'Ruha',
    dir: 'ruha',
    image: '/maps/ruha.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'wl_rosche',
    width: '15360',
    height: '15360',
    offset: '300',
    zoom: '7',
    name: 'Rosche',
    dir: 'wl_rosche',
    image: '/maps/rosche.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'tem_kujari',
    width: '16384',
    height: '16384',
    offset: '300',
    zoom: '8',
    name: 'Kujari',
    dir: 'tem_kujari',
    image: '/maps/kujari.png',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'khe_sanh',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '9',
  //   name: '',
  //   dir: 'khe_sanh',
  //   image: '/maps/khe_sanh.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'DaKrong',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '9',
  //   name: '',
  //   dir: 'DaKrong',
  //   image: '/maps/DaKrong.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'RungSat',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '9',
  //   name: '',
  //   dir: 'RungSat',
  //   image: '/maps/RungSat.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'prei_khmaoch_luong',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '9',
  //   name: '',
  //   dir: 'prei_khmaoch_luong',
  //   image: '/maps/prei_khmaoch_luong.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'tem_anizay',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'Anizay',
    dir: 'tem_anizay',
    image: '/maps/anizay.jpg',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'VR',
  //   width: null,
  //   height: null,
  //   offset: '300',
  //   zoom: '9',
  //   name: '',
  //   dir: 'VR',
  //   image: '/maps/VR.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'vinjesvingenc',
  //   width: '6155',
  //   height: '6155',
  //   offset: '300',
  //   zoom: '9',
  //   name: 'Vinjesvingenc',
  //   dir: 'vinjesvingenc',
  //   image: '/maps/vinjesvingenc.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'hellanmaa_winter',
  //   width: '8192',
  //   height: '8192',
  //   offset: '300',
  //   zoom: '9',
  //   name: 'Hellanmaa Winter',
  //   dir: 'hellanmaa',
  //   image: '/maps/hellanmaa.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'bootcamp_acr',
    width: 8192,
    height: 8192,
    offset: '300',
    zoom: '5',
    name: 'Bukovina',
    dir: 'bootcamp_acr',
    image: '/maps/bukovina.jpg',
    author: 'Bohemia Interactive',
  },
  // {
  //   id: 'weferlingen',
  //   width: '20480',
  //   height: '20480',
  //   offset: '300',
  //   zoom: '9',
  //   name: 'Weferlingen Summer',
  //   dir: 'weferlingen',
  //   image: '/maps/weferlingen.jpg',
  //   author: 'Bohemia Interactive',
  // },
  // {
  //   id: 'weferlingen',
  //   width: '20480',
  //   height: '20480',
  //   offset: '300',
  //   zoom: '9',
  //   name: 'Weferlingen Winter',
  //   dir: 'weferlingen',
  //   image: '/maps/weferlingen.jpg',
  //   author: 'Bohemia Interactive',
  // },
  {
    id: 'vt7',
    width: '18000',
    height: '18000',
    offset: '300',
    zoom: '8',
    name: 'Valtatie 7',
    dir: 'vt7',
    image: '/maps/valtatie7.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'umb_colombia',
    width: '20480',
    height: '20480',
    offset: '300',
    zoom: '8',
    name: 'Colombia',
    dir: 'umb_colombia',
    image: '/maps/colombia.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'cup_chernarus_a3',
    width: '15360',
    height: '15360',
    offset: '300',
    zoom: '7',
    name: 'Chernarus 2000',
    dir: 'cup_chernarus_a3',
    image: '/maps/chernarus.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'rof_mok',
    width: '24576',
    height: '24576',
    offset: '300',
    zoom: '8',
    name: 'Mull of Kintyre',
    dir: 'rof_mok',
    image: '/maps/mull_of_kintyre.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'brf_sumava',
    width: '12288',
    height: '12288',
    offset: '300',
    zoom: '7',
    name: 'Šumava',
    dir: 'brf_sumava',
    image: '/maps/sumava.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'enoch',
    width: '12800',
    height: '12800',
    offset: '300',
    zoom: '7',
    name: 'Livonia',
    dir: 'enoch',
    image: '/maps/enoch.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'farabad',
    width: '10752',
    height: '10752',
    offset: '300',
    zoom: '7',
    name: 'Farabad',
    dir: 'farabad',
    image: '/maps/farabad.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'hellanmaa',
    width: '8192',
    height: '8192',
    offset: '300',
    zoom: '7',
    name: 'Hellanmaa',
    dir: 'hellanmaa',
    image: '/maps/hellanmaa.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'islapera',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'Isla Pera',
    dir: 'islapera',
    image: '/maps/islapera.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'kunduz_valley',
    width: '10240',
    height: '10240',
    offset: '300',
    zoom: '7',
    name: 'Kunduz River',
    dir: 'kunduz_valley',
    image: '/maps/kunduz_valley.jpg',
    author: 'Bohemia Interactive',
  },
  {
    id: 'northtakistan',
    width: '12288',
    height: '12288',
    offset: '300',
    zoom: '7',
    name: 'North Takistan',
    dir: 'northtakistan',
    image: '/maps/northtakistan.png',
    author: 'Bohemia Interactive',
  },
  {
    id: 'vtf_korsac',
    width: '8192',
    height: '8192',
    offset: '300',
    zoom: '7',
    name: 'Korsac',
    dir: 'vtf_korsac',
    image: '/maps/korsac.jpg',
    author: 'Bohemia Interactive',
  },
].sort((a, b) => a.name.localeCompare(b.name));

export { mapList };
