/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attribute, Insert, SelectorFind, SugarElement } from '@ephox/sugar';

/*
 * The purpose of this fix is to toggle the presence of a meta tag which disables scrolling
 * for the user
 */
const tag = () => {
  const head = SelectorFind.first('head').getOrDie();

  const nu = () => {
    const meta = SugarElement.fromTag('meta');
    Attribute.set(meta, 'name', 'viewport');
    Insert.append(head, meta);
    return meta;
  };

  const element = SelectorFind.first('meta[name="viewport"]').getOrThunk(nu);
  const backup = Attribute.get(element, 'content');

  const maximize = () => {
    Attribute.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
  };

  const restore = () => {
    if (backup !== undefined && backup !== null && backup.length > 0) {
      Attribute.set(element, 'content', backup);
    } else {
      // According to apple docs the default is:
      //  width=980
      //  height=<calculated>
      //  initial-scale=<calculated>
      //  minimum-scale=0.25
      //  maximum-scale=5.0
      //  user-scalable yes
      // However just setting user-scalable seems to fix pinch zoom and who knows these defaults might change
      Attribute.set(element, 'content', 'user-scalable=yes');
    }
  };

  return {
    maximize,
    restore
  };
};

export {
  tag
};
