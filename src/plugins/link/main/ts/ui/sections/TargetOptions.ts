/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';

import Settings from '../../api/Settings';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

// In current tinymce, targets can be nested menus.
// Do we really want to support that?

const fallbacks = [
  { text: 'Current window', value: '' },
  { text: 'New window', value: '_blank' }
];

const getTargets = (editor): Option<ListItem[]> => {
  if (Settings.shouldShowTargetList(editor.settings)) {
    const list = Settings.getTargetList(editor.settings);
    return ListOptions.sanitize(list).orThunk(
      () => Option.some(fallbacks)
    );
  }
  return Option.none();
};

export const TargetOptions = {
  getTargets
};