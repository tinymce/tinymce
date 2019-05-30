/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TableSelection } from '@ephox/darwin';
import * as Util from '../alien/Util';
import Ephemera from './Ephemera';
import SelectionTypes from './SelectionTypes';
import Editor from 'tinymce/core/api/Editor';

export interface Selections {
  get: () => any;
}

export const Selections = function (editor: Editor) {
  const get = function () {
    const body = Util.getBody(editor);

    return TableSelection.retrieve(body, Ephemera.selectedSelector()).fold(function () {
      if (editor.selection.getStart() === undefined) {
        return SelectionTypes.none();
      } else {
        return SelectionTypes.single(editor.selection);
      }
    }, function (cells) {
      return SelectionTypes.multiple(cells);
    });
  };

  return {
    get
  };
};