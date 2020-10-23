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
import * as Utils from '../../core/Utils';
import { ListItem } from '../DialogTypes';

const getRels = (editor: Editor, initialTarget: Optional<string>): Optional<ListItem[]> => {
  const list = Settings.getRelList(editor);
  if (list.length > 0) {
    const isTargetBlank = initialTarget.is('_blank');
    const enforceSafe = Settings.allowUnsafeLinkTarget(editor) === false;
    const safeRelExtractor = (item) => Utils.applyRelTargetRules(ListOptions.getValue(item), isTargetBlank);
    const sanitizer = enforceSafe ? ListOptions.sanitizeWith(safeRelExtractor) : ListOptions.sanitize;
    return sanitizer(list);
  }
  return Optional.none();
};

export const RelOptions = {
  getRels
};
