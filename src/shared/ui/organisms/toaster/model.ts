import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable } from 'mobx';

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

  removeToaster = (id: string) => {
    this.toasters = this.toasters.filter((toaster) => toaster.id !== id);
  };

  call = async ({
    id = generateRandomId(),
    sound = true,
    timer = 4000,
    type = 'radio',
    ...data
  }: ToasterData) => {
    if (sound) {
      const audio = new Audio('/sounds/notification/start.mp3');
      audio.volume = 0.3;
      audio.play();
    }

    this.toasters.unshift({
      ...data,
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

    if (sound) {
      setTimeout(() => {
        const audio = new Audio('/sounds/notification/end.mp3');
        audio.volume = 0.3;
        audio.play();
      }, timer - 700);
    }
  };
}

const toasterEntity = new Toaster();

export { Toaster, toasterEntity };
