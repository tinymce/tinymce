import { Unicode } from '@ephox/katamari';
import { Node, Text, Traverse } from '@ephox/sugar';
import { isCaretNode } from 'tinymce/core/fmt/FormatContainer';
import FormatUtils from '../fmt/FormatUtils';
import { isAnnotation } from './Identification';
import { Editor } from 'tinymce/core/api/Editor';

export const enum ChildContext {
  Skipping = 'skipping',
  Existing = 'existing',
  InvalidChild = 'invalid-child',
  Caret = 'caret',
  Valid = 'valid'
}

const isZeroWidth = (elem): boolean => {
  // TODO: I believe this is the same cursor used in tinymce (Unicode.zeroWidth)?
  return Node.isText(elem) && Text.get(elem) === Unicode.zeroWidth();
};

const context = (editor: Editor, elem: any, wrapName: string, nodeName: string): ChildContext => {
  return Traverse.parent(elem).fold(
    () => ChildContext.Skipping,

    (parent) => {
      if (nodeName === 'br' || isZeroWidth(elem)) {
        return ChildContext.Skipping;
      } else if (isAnnotation(elem)) {
        return ChildContext.Existing;
      } else if (isCaretNode(elem)) {
        return ChildContext.Caret;
      } else if (!FormatUtils.isValid(editor, wrapName, nodeName) || !FormatUtils.isValid(editor, Node.name(parent), wrapName)) {
        return ChildContext.InvalidChild;
      } else {
        return ChildContext.Valid;
      }
    }
  );
};

export {
  context
};