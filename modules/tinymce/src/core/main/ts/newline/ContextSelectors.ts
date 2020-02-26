/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Selectors } from '@ephox/sugar';
import * as Settings from '../api/Settings';
import * as NewLineUtils from './NewLineUtils';
import Editor from '../api/Editor';

const matchesSelector = function (editor: Editor, selector: string) {
  return NewLineUtils.getParentBlock(editor).filter(function (parentBlock) {
    return selector.length > 0 && Selectors.is(Element.fromDom(parentBlock), selector);
  }).isSome();
};

const shouldInsertBr = function (editor: Editor) {
  return matchesSelector(editor, Settings.getBrNewLineSelector(editor));
};

const shouldBlockNewLine = function (editor: Editor) {
  return matchesSelector(editor, Settings.getNoNewLineSelector(editor));
};

export {
  shouldInsertBr,
  shouldBlockNewLine
};
