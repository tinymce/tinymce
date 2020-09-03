/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { Compare, Css, SugarElement, SugarNode, TransformFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import * as NodeType from '../dom/NodeType';

const findFirstCaretElement = (editor: Editor): Optional<Node> => CaretFinder.firstPositionIn(editor.getBody()).map((caret) => {
  const container = caret.container();
  return NodeType.isText(container) ? container.parentNode : container;
});

const isRangeAtStartOfNode = (rng: Range, root: Node) => rng.startContainer === root && rng.startOffset === 0;

const getCaretElement = (editor: Editor): Optional<Node> => Optional.from(editor.selection.getRng()).bind((rng) => {
  const root = editor.getBody();
  return isRangeAtStartOfNode(rng, root) ? Optional.none() : Optional.from(editor.selection.getStart(true));
});

const getLineHeight = (elm: SugarElement<Element>, editor: Editor): string => {
  const root = SugarElement.fromDom(editor.getBody());
  const isRoot = Fun.curry(Compare.eq, root);
  const specifiedStyle = TransformFind.closest(elm, (elm) => Css.getRaw(elm, 'line-height'), isRoot);

  const computedStyle = () => {
    // Css.get returns computed values (in px), and parseFloat will strip any non-number suffix
    const lineHeight = parseFloat(Css.get(elm, 'line-height'));
    const fontSize = parseFloat(Css.get(elm, 'font-size'));
    return String(lineHeight / fontSize);
  };

  return specifiedStyle.getOrThunk(computedStyle);
};

export const lineHeightQuery = (editor: Editor) => getCaretElement(editor)
  .orThunk(() => findFirstCaretElement(editor))
  .map(SugarElement.fromDom)
  .filter(SugarNode.isElement)
  .map((node) => getLineHeight(node, editor))
  .getOr('');

export const lineHeightAction = (editor: Editor, lineHeight: number) => {
  editor.formatter.toggle('lineheight', { value: String(lineHeight) });
  editor.nodeChanged();
};
