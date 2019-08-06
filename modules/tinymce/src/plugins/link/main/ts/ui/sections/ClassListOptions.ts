/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../../api/Settings';
import { Option } from '@ephox/katamari';
import { ListItem } from '../DialogTypes';
import { ListOptions } from '../../core/ListOptions';

// Looks like tinymce currently renders menus, but doesn't
// let you choose from one.

const getClasses = (editor): Option<ListItem[]> => {
  const list = Settings.getLinkClassList(editor);
  if (list.length > 0) {
    return ListOptions.sanitize(list);
  }
  return Option.none();
};

export const ClassListOptions = {
  getClasses
};