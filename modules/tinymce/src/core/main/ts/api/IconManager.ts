import { Obj } from '@ephox/katamari';

export interface IconPack {
  icons: Record<string, string>;
}

interface IconManager {
  add: (id: string, iconPack: IconPack) => void;
  get: (id: string) => IconPack;
  has: (id: string) => boolean;
}

const CreateIconManager = (): IconManager => {
  const lookup: Record<string, IconPack> = {};

  const add = (id: string, iconPack: IconPack) => {
    lookup[id] = iconPack;
  };

  const get = (id: string) => {
    if (lookup[id]) {
      return lookup[id];
    } else {
      return { icons: {}};
    }
  };

  const has = (id: string) => Obj.has(lookup, id);

  return {
    add,
    get,
    has
  };
};

const IconManager: IconManager = CreateIconManager();

export default IconManager;
