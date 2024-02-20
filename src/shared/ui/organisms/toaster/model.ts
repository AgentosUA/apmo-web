import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable } from 'mobx';

type ToasterType = 'success' | 'error' | 'warning' | 'info';

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

    this.toasters.push({
      ...data,
      visible: true,
      id,
    });

    setTimeout(() => {
      const index = this.toasters.findIndex((toaster) => toaster.id === id);

      if (index === -1) return;

      this.toasters[index].visible = false;
    }, data.timer);

    setTimeout(() => {
      this.removeToaster(id);
    }, data.timer + 200);
  };
}

const toasterEntity = new Toaster();

export { Toaster, toasterEntity };
