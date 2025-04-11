import enLocale from './en';

const czLocale: typeof enLocale = {
  common: {
    back: 'Zpátky',
    continue: 'Pokračovat',
    confirm: 'Potvrdit',
    cancel: 'Zrušit',
  },
  entities: {
    markers: {
      copiedTitle: 'Markery zkopírovány',
      copiedDescription: 'Markery zkopírovány do schránky',
      clearedTitle: 'Markery vymazány',
      clearedDescription: 'Všechny markery byly odstraněny',
      loadedTitle: 'Markery načteny',
      loadedDescription: 'Načteno markerů: {{count}}',
    },
  },
  widgets: {
    header: {
      logIn: 'Přihlásit se',
      logOut: 'Odhlásit se',
      changelog: 'Seznam změn',
      support: 'Podpořit',
      signUp: 'Registrovat se',
      profile: 'Profil',
    },
    mapOverlay: {
      markers: 'Markery',
      briefing: 'Briefing',
      mission: 'Mise',
      slots: 'Sloty',
      plan: 'Plán',
      loadMarkers: 'Načíst markery',
      copyMarkers: 'Kopírovat markery',
      clearMarkers: 'Vymazat markery',
      showAllPlayers: 'Zobrazit všechny hráče',
      showGroups: 'Zobrazit skupiny',
      hideNames: 'Skrýt jména',
      showNames: 'Zobrazit jména',
      savePlan: 'Uložit plán',
      sharePlan: 'Sdílet plán',
      uploadMission: 'Nahrát mise',
      intel: 'Intel',
      dlcs: 'DLČ',
      slotsBluefor: 'Sloty BLUEFOR',
      slotsOpfor: 'Sloty OPFOR',
      slotsIndependent: 'Sloty Independent',
      map: 'Mapa',
      clearMarkersTitle: 'Vymazat všechny markery',
      clearMarkersDescription: 'Jste si jisti, že chcete vymazat všechny markery z mapy?',
    },
    footer: {
      createdBy: 'Vytvořil',
      feelFreeToContribute: 'Přidejte se k vývoji na',
    },
  },
  pages: {
    home: {
      selectMap: 'Vybrat mapu',
      loadMission: 'Načíst mise',
      changelog: 'Seznam změn',
    },
    profile: {
      myPlans: 'Moje plány',
      viewPlan: 'Zobrazit',
      copyMarkers: 'Kopírovat markery',
      copySlots: 'Kopírovat sloty',
      deletePlan: 'Smazat',
      changePassword: 'Změnit heslo',
      logout: 'Odhlásit se',
      changeAvatar: 'Změnit avatar',
      avatarUrl: 'URL avataru',
    },
  },
};

export default czLocale;
