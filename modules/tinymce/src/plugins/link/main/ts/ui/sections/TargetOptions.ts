/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Type } from '@ephox/katamari';

import * as Settings from '../../api/Settings';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';
import Editor from 'tinymce/core/api/Editor';

// In current tinymce, targets can be nested menus.
// Do we really want to support that?

const fallbacks = [
  { text: 'Current window', value: '' },
  { text: 'New window', value: '_blank' }
];

const getTargets = (editor: Editor): Option<ListItem[]> => {
  const list = Settings.getTargetList(editor);
  if (Type.isArray(list)) {
    return ListOptions.sanitize(list).orThunk(
      () => Option.some(fallbacks)
    );
  } else if (list === false) {
    return Option.none();
  }
  return Option.some(fallbacks);
};

export const TargetOptions = {
  getTargets
};
