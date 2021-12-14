/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import { fireFakeInputEvent } from '../keyboard/FakeInputEvents';
import * as InsertBlock from './InsertBlock';
import * as InsertBr from './InsertBr';
import * as NewLineAction from './NewLineAction';

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => {
  NewLineAction.getAction(editor, evt).fold(
    () => {
      InsertBr.insert(editor, evt);
      if (Type.isNonNullable(evt)) {
        fireFakeInputEvent(editor, 'insertLineBreak');
      }
    },
    () => {
      InsertBlock.insert(editor, evt);
      if (Type.isNonNullable(evt)) {
        fireFakeInputEvent(editor, 'insertParagraph');
      }
    },
    Fun.noop
  );
};

export {
  insert
};
