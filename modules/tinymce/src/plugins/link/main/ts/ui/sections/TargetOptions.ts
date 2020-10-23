/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Type } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../../api/Settings';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

// In current tinymce, targets can be nested menus.
// Do we really want to support that?

const fallbacks = [
  { text: 'Current window', value: '' },
  { text: 'New window', value: '_blank' }
];

const getTargets = (editor: Editor): Optional<ListItem[]> => {
  const list = Settings.getTargetList(editor);
  if (Type.isArray(list)) {
    return ListOptions.sanitize(list).orThunk(
      () => Optional.some(fallbacks)
    );
  } else if (list === false) {
    return Optional.none();
  }
  return Optional.some(fallbacks);
};

export const TargetOptions = {
  getTargets
};
