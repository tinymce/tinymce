/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import VK from '../api/util/VK';
import * as CefNavigation from './CefNavigation';
import * as MatchKeys from './MatchKeys';
import * as MediaNavigation from './MediaNavigation';

const executeKeydownOverride = (editor: Editor, evt: KeyboardEvent) => {
  MatchKeys.execute([
    { keyCode: VK.END, action: MatchKeys.action(CefNavigation.moveToLineEndPoint, editor, true) },
    { keyCode: VK.HOME, action: MatchKeys.action(CefNavigation.moveToLineEndPoint, editor, false) },
    { keyCode: VK.END, action: MatchKeys.action(MediaNavigation.moveToLineEndPoint, editor, true) },
    { keyCode: VK.HOME, action: MatchKeys.action(MediaNavigation.moveToLineEndPoint, editor, false) }
  ], evt).each((_) => {
    evt.preventDefault();
  });
};

const setup = (editor: Editor) => {
  editor.on('keydown', (evt) => {
    if (evt.isDefaultPrevented() === false) {
      executeKeydownOverride(editor, evt);
    }
  });
};

export {
  setup
};
