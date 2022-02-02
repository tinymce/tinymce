/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selectors, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import * as NewLineUtils from './NewLineUtils';

const matchesSelector = (editor: Editor, selector: string) => {
  return NewLineUtils.getParentBlock(editor).filter((parentBlock) => {
    return selector.length > 0 && Selectors.is(SugarElement.fromDom(parentBlock), selector);
  }).isSome();
};

const shouldInsertBr = (editor: Editor) => {
  return matchesSelector(editor, Settings.getBrNewLineSelector(editor));
};

const shouldBlockNewLine = (editor: Editor) => {
  return matchesSelector(editor, Settings.getNoNewLineSelector(editor));
};

export {
  shouldInsertBr,
  shouldBlockNewLine
};
