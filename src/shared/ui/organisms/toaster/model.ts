import { makeAutoObservable } from 'mobx';

import { i18n } from '@/shared/lib/i18n/config';
import { generateRandomId } from '@/shared/utils/string';

type ToasterType = 'radio';

type ToasterData = {
  id?: string;
  title: string;
  description?: string;
  visible?: boolean;
  type?: ToasterType;
  timer?: number;
  sound?: boolean;
};

class Toaster {
  constructor() {
    makeAutoObservable(this);
  }

  toasters: ToasterData[] = [];

  /** Global switch for notification sounds (user setting, see SettingsStore). */
  isSoundEnabled = true;

  setSoundEnabled = (enabled: boolean) => {
    this.isSoundEnabled = enabled;
  };

  removeToaster = (id: string) => {
    this.toasters = this.toasters.filter((toaster) => toaster.id !== id);
  };

  call = async ({
    id = generateRandomId(),
    sound = true,
    timer = 4000,
    type = 'radio',
    title = '',
    description = '',
    ...data
  }: ToasterData) => {
    const playSound = sound && this.isSoundEnabled;

    if (playSound) {
      const audio = new Audio('/sounds/notification/start.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }

    this.toasters.unshift({
      ...data,
      // Only i18n keys are translated: raw messages (API / validation errors)
      // contain ':' and '.', which i18next would read as namespace / key paths.
      title: i18n.exists(title) ? i18n.t(title) : title,
      description: i18n.exists(description) ? i18n.t(description) : description,
      id,
      sound,
      type,
      visible: true,
    });

    setTimeout(() => {
      const index = this.toasters.findIndex((toaster) => toaster.id === id);

      if (index === -1) return;

      this.toasters[index].visible = false;
      this.removeToaster(id);
    }, timer);

    if (playSound) {
      setTimeout(() => {
        const audio = new Audio('/sounds/notification/end.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }, timer - 700);
    }
  };
}

const toasterEntity = new Toaster();

export { Toaster, toasterEntity };
