/**
 * IconManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

export interface IconPack {
  icons: Record<string, string>;
}

export interface IconManager {
  add: (id: string, iconPack: IconPack) => void;
  get: (id: string) => IconPack;
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

  return {
    add,
    get
  };
};

export const IconManager = CreateIconManager();