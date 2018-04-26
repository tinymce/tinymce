/**
 * SpaceKey.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import InsertSpace from './InsertSpace';
import MatchKeys from './MatchKeys';
import VK from '../api/util/VK';
import { Editor } from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/dom/EventUtils';

const executeKeydownOverride = function (editor: Editor, evt: KeyboardEvent) {
  MatchKeys.execute([
    { keyCode: VK.SPACEBAR, action: MatchKeys.action(InsertSpace.insertAtSelection, editor) }
  ], evt).each(function (_) {
    evt.preventDefault();
  });
};

const setup = function (editor: Editor) {
  editor.on('keydown', function (evt: EditorEvent<KeyboardEvent>) {
    if (evt.isDefaultPrevented() === false) {
      executeKeydownOverride(editor, evt);
    }
  });
};

export default {
  setup
};