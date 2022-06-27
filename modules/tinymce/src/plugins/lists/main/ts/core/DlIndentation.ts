import { Arr } from '@ephox/katamari';
import { Replication, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { Indentation } from '../listmodel/Indentation';
import * as SplitList from './SplitList';

const isDescriptionDetail = SugarNode.isTag('dd');
const isDescriptionTerm = SugarNode.isTag('dt');

const outdentDlItem = (editor: Editor, item: SugarElement<Node>): void => {
  if (isDescriptionDetail(item)) {
    Replication.mutate(item, 'dt');
  } else if (isDescriptionTerm(item)) {
    Traverse.parentElement(item).each((dl) => SplitList.splitList(editor, dl.dom, item.dom));
  }
};

const indentDlItem = (item: SugarElement<Node>): void => {
  if (isDescriptionTerm(item)) {
    Replication.mutate(item, 'dd');
  }
};

const dlIndentation = (editor: Editor, indentation: Indentation, dlItems: SugarElement<Node>[]): void => {
  if (indentation === Indentation.Indent) {
    Arr.each(dlItems, indentDlItem);
  } else {
    Arr.each(dlItems, (item) => outdentDlItem(editor, item));
  }
};

export {
  dlIndentation
};
