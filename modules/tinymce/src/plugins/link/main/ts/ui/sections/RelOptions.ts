/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';

import * as Settings from '../../api/Settings';
import * as Utils from '../../core/Utils';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';
import Editor from 'tinymce/core/api/Editor';

const getRels = (editor: Editor, initialTarget: Option<string>): Option<ListItem[]> => {
  const list = Settings.getRelList(editor);
  if (list.length > 0) {
    const isTargetBlank = initialTarget.is('_blank');
    const enforceSafe = Settings.allowUnsafeLinkTarget(editor) === false;
    const safeRelExtractor = (item) => Utils.applyRelTargetRules(ListOptions.getValue(item), isTargetBlank);
    const sanitizer = enforceSafe ? ListOptions.sanitizeWith(safeRelExtractor) : ListOptions.sanitize;
    return sanitizer(list);
  }
  return Option.none();
};

export const RelOptions = {
  getRels
};
