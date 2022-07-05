import { Selectors, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as NewLineUtils from './NewLineUtils';

const matchesSelector = (editor: Editor, selector: string) => {
  return NewLineUtils.getParentBlock(editor).filter((parentBlock) => {
    return selector.length > 0 && Selectors.is(SugarElement.fromDom(parentBlock), selector);
  }).isSome();
};

const shouldInsertBr = (editor: Editor): boolean => {
  return matchesSelector(editor, Options.getBrNewLineSelector(editor));
};

const shouldBlockNewLine = (editor: Editor): boolean => {
  return matchesSelector(editor, Options.getNoNewLineSelector(editor));
};

export {
  shouldInsertBr,
  shouldBlockNewLine
};
