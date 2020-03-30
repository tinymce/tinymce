/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import Editor from '../api/Editor';
import { FormatVars } from '../api/fmt/Format';
import * as ApplyFormat from './ApplyFormat';
import * as MatchFormat from './MatchFormat';
import * as RemoveFormat from './RemoveFormat';

const toggle = (editor: Editor, name: string, vars: FormatVars, node: Node) => {
  const fmt = editor.formatter.get(name);

  if (MatchFormat.match(editor, name, vars, node) && (!('toggle' in fmt[0]) || fmt[0].toggle)) {
    RemoveFormat.remove(editor, name, vars, node);
  } else {
    ApplyFormat.applyFormat(editor, name, vars, node);
  }
};

export {
  toggle
};
