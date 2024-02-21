import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable } from 'mobx';

type ToasterType = 'radio';

type ToasterData = {
  id?: string;
  title: string;
  description: string;
  visible?: boolean;
  type: ToasterType;

  timer: number;
};

class Toaster {
  constructor() {
    makeAutoObservable(this);
  }

  toasters: ToasterData[] = [];

  removeToaster = (id: string) => {
    this.toasters = this.toasters.filter((toaster) => toaster.id !== id);
  };

  callToaster = async (data: ToasterData) => {
    const id = data.id ?? generateRandomId();
    const timer = data.timer ?? 4000;

    this.toasters.push({
      ...data,
      visible: true,
      id,
    });

    setTimeout(() => {
      const index = this.toasters.findIndex((toaster) => toaster.id === id);

      if (index === -1) return;

      this.toasters[index].visible = false;
    }, timer);

    setTimeout(() => {
      this.removeToaster(id);
    }, timer);
  };
}

const toasterEntity = new Toaster();

export { Toaster, toasterEntity };
