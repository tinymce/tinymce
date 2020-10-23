/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import { isCaretNode } from '../fmt/FormatContainer';
import * as FormatUtils from '../fmt/FormatUtils';
import { ZWSP } from '../text/Zwsp';
import { isAnnotation } from './Identification';

export const enum ChildContext {
  // Was previously used for br and zero width cursors. Keep as a state
  // because we'll probably want to reinstate it later.
  Skipping = 'skipping',
  Existing = 'existing',
  InvalidChild = 'invalid-child',
  Caret = 'caret',
  Valid = 'valid'
}

const isZeroWidth = (elem: SugarElement<Node>): boolean =>
  SugarNode.isText(elem) && SugarText.get(elem) === ZWSP;

const context = (editor: Editor, elem: SugarElement, wrapName: string, nodeName: string): ChildContext => Traverse.parent(elem).fold(
  () => ChildContext.Skipping,

  (parent) => {
    // We used to skip these, but given that they might be representing empty paragraphs, it probably
    // makes sense to treat them just like text nodes
    if (nodeName === 'br' || isZeroWidth(elem)) {
      return ChildContext.Valid;
    } else if (isAnnotation(elem)) {
      return ChildContext.Existing;
    } else if (isCaretNode(elem.dom)) {
      return ChildContext.Caret;
    } else if (!FormatUtils.isValid(editor, wrapName, nodeName) || !FormatUtils.isValid(editor, SugarNode.name(parent), wrapName)) {
      return ChildContext.InvalidChild;
    } else {
      return ChildContext.Valid;
    }
  }
);

export {
  context
};
