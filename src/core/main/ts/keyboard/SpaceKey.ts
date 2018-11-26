/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as InsertSpace from './InsertSpace';
import MatchKeys from './MatchKeys';
import VK from '../api/util/VK';
import { Editor } from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/dom/EventUtils';
import { KeyboardEvent } from '@ephox/dom-globals';

const executeKeydownOverride = function (editor: Editor, evt: KeyboardEvent) {
  MatchKeys.execute([
    { keyCode: VK.SPACEBAR, action: MatchKeys.action(InsertSpace.insertSpaceOrNbspAtSelection, editor) }
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