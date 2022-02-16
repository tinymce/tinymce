/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from '../keyboard/FakeInputEvents';
import * as InsertBlock from './InsertBlock';
import * as InsertBr from './InsertBr';
import * as NewLineAction from './NewLineAction';

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => {
  const insertBlock = (predicate: (node: Element) => boolean) =>
    () => {
      if (Type.isNonNullable(evt)) {
        const event = fireFakeBeforeInputEvent(editor, 'insertParagraph');
        if (event.isDefaultPrevented()) {
          return;
        }
      }

      InsertBlock.insert(editor, predicate, evt);

      if (Type.isNonNullable(evt)) {
        fireFakeInputEvent(editor, 'insertParagraph');
      }
    };

  NewLineAction.getAction(editor, evt).fold(
    () => {
      if (Type.isNonNullable(evt)) {
        const event = fireFakeBeforeInputEvent(editor, 'insertLineBreak');
        if (event.isDefaultPrevented()) {
          return;
        }
      }

      InsertBr.insert(editor, evt);

      if (Type.isNonNullable(evt)) {
        fireFakeInputEvent(editor, 'insertLineBreak');
      }
    },
    insertBlock(Fun.always),
    insertBlock((node) => node.tagName === 'BLOCKQUOTE'),
    Fun.noop
  );
};

export {
  insert
};
