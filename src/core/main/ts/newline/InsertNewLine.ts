/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import InsertBlock from './InsertBlock';
import InsertBr from './InsertBr';
import NewLineAction from './NewLineAction';
import { Editor } from '../api/Editor';
import { EditorEvent } from '../api/dom/EventUtils';
import { KeyboardEvent } from '@ephox/dom-globals';

const insert = function (editor: Editor, evt: EditorEvent<KeyboardEvent>) {
  NewLineAction.getAction(editor, evt).fold(
    function () {
      InsertBr.insert(editor, evt);
    },
    function () {
      InsertBlock.insert(editor, evt);
    },
    Fun.noop
  );
};

export default {
  insert
};