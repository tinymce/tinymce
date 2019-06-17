/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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
    }

    return { icons: {} };
  };

  const has = (id: string) => {
    return Obj.has(lookup, id);
  };

  return {
    add,
    get,
    has
  };
};

const IconManager: IconManager = CreateIconManager();

export default IconManager;