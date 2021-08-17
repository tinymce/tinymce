/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../../api/Settings';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

// Looks like tinymce currently renders menus, but doesn't
// let you choose from one.

const getClasses = (editor: Editor): Optional<ListItem[]> => {
  const list = Settings.getLinkClassList(editor);
  if (list.length > 0) {
    return ListOptions.sanitize(list);
  }
  return Optional.none();
};

export const ClassListOptions = {
  getClasses
};
