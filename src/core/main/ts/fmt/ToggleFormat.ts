/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import ApplyFormat from './ApplyFormat';
import MatchFormat from './MatchFormat';
import RemoveFormat from './RemoveFormat';
import Editor from '../api/Editor';
import { FormatRegistry } from './FormatRegistry';

const toggle = function (editor: Editor, formats: FormatRegistry, name: string, vars, node) {
  const fmt = formats.get(name);

  if (MatchFormat.match(editor, name, vars, node) && (!('toggle' in fmt[0]) || fmt[0].toggle)) {
    RemoveFormat.remove(editor, name, vars, node);
  } else {
    ApplyFormat.applyFormat(editor, name, vars, node);
  }
};

export default {
  toggle
};