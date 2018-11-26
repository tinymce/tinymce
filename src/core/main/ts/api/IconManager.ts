/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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