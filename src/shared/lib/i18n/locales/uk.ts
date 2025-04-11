import enLocale from './en';

const ukLocale: typeof enLocale = {
  common: {
    back: 'Назад',
    continue: 'Продовжити',
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
    loading: 'Завантаження',
  },
  entities: {
    markers: {
      copiedTitle: 'Маркери скопійовано',
      copiedDescription: 'Маркери скопійовано у буфер обміну',
      clearedTitle: 'Маркери очищені',
      clearedDescription: 'Всі маркери були очищені',
      loadedTitle: 'Маркери завантажені',
      loadedDescription: 'Маркерів завантажено: {{count}}',
    },
    slots: {
      copiedTitle: 'Слоти скопійовано',
      copiedDescription: 'Слоти скопійовано у буфер обміну',
    },
  },
  widgets: {
    header: {
      logIn: 'Увійти',
      logOut: 'Вийти',
      changelog: 'Список змін',
      support: 'Підтримати',
      signUp: 'Зареєструватися',
      profile: 'Профіль',
    },
    mapOverlay: {
      markers: 'Маркери',
      briefing: 'Брифінг',
      mission: 'Місія',
      slots: 'Слоти',
      plan: 'План',
      loadMarkers: 'Завантажити маркери',
      copyMarkers: 'Скопіювати маркери',
      clearMarkers: 'Очистити маркери',
      showAllPlayers: 'Показати всіх гравців',
      showGroups: 'Показати групи',
      hideNames: 'Приховати імена',
      showNames: 'Показати імена',
      savePlan: 'Зберегти план',
      sharePlan: 'Поділитися планом',
      uploadMission: 'Завантажити місію',
      intel: 'Розвіддані',
      dlcs: 'DLC',
      slotsBluefor: 'Слоти BLUEFOR',
      slotsOpfor: 'Слоти OPFOR',
      slotsIndependent: 'Слоти Independent',
      map: 'Карта',
      clearMarkersTitle: 'Очистити всі маркери',
      clearMarkersDescription: 'Ви впевнені, що хочете очистити всі маркери з карти?',
      enterSquadName: 'Введіть назву групи',
      list: 'Список',
      grid: 'Сітка',
      copySlots: 'Скопіювати слоти',
      planLinkCopiedTitle: 'План скопійовано',
      planLinkCopiedDescription: 'Ви можете поділитися ним з командою',
    },
    footer: {
      createdBy: 'Створено',
      feelFreeToContribute: 'Долучайтеся до розробки на',
    },

  },
  pages: {
    home: {
      selectMap: 'Обрати карту',
      loadMission: 'Завантажити місію',
      changelog: 'Список змін',
    },
    plans: {
      planNotFound: 'План не знайдено',
    },
    profile: {
      myPlans: 'Мої плани',
      viewPlan: 'Переглянути',
      copyMarkers: 'Скопіювати маркери',
      copySlots: 'Скопіювати слоти',
      deletePlan: 'Видалити',
      changePassword: 'Змінити пароль',
      logout: 'Вийти',
      changeAvatar: 'Змінити аватар',
      avatarUrl: 'URL аватара',
    },
  },
};

export default ukLocale;
