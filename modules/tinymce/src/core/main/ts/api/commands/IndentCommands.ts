/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as IndentOutdent from '../../commands/IndentOutdent';
import type Editor from '../Editor';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    Indent: () => {
      IndentOutdent.indent(editor);
    },

    Outdent: () => {
      IndentOutdent.outdent(editor);
    },
  });

  editor.editorCommands.addCommands({
    Outdent: () => IndentOutdent.canOutdent(editor),
  }, 'state');
};
