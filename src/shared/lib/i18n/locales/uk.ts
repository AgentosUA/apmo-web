import enLocale from './en';

const ukLocale: typeof enLocale = {
  common: {
    back: 'Назад',
    continue: 'Продовжити',
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
      briefing: 'Бріфінг',
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
      intel: 'Інтел',
      dlcs: 'ДЛЦ',
      slotsBluefor: 'Слоти BLUEFOR',
      slotsOpfor: 'Слоти OPFOR',
      slotsIndependent: 'Слоти Independent',
      map: 'Карта',
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
