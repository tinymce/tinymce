import { Arr, Strings } from '@ephox/katamari';
import { Css, PredicateFind, SugarElement, SugarElements, Traverse } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import { isList, isListItem, isTable } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';

type IndentStyle = 'margin-left' | 'margin-right' | 'padding-left' | 'padding-right';

const isEditable = (target: SugarElement<Node>): boolean =>
  PredicateFind.closest(target, (elm) => NodeType.isContentEditableTrue(elm.dom) || NodeType.isContentEditableFalse(elm.dom))
    .exists((elm) => NodeType.isContentEditableTrue(elm.dom));

const parseIndentValue = (value: string | undefined): number =>
  Strings.toInt(value ?? '').getOr(0);

const getIndentStyleName = (useMargin: boolean, element: SugarElement<HTMLElement>): IndentStyle => {
  const indentStyleName = useMargin || isTable(element) ? 'margin' : 'padding';
  const suffix = Css.get(element, 'direction') === 'rtl' ? '-right' : '-left';
  return indentStyleName + suffix as IndentStyle;
};

const indentElement = (dom: DOMUtils, command: string, useMargin: boolean, value: number, unit: string, element: HTMLElement): void => {
  const indentStyleName = getIndentStyleName(useMargin, SugarElement.fromDom(element));
  const parsedValue = parseIndentValue(dom.getStyle(element, indentStyleName));

  if (command === 'outdent') {
    const styleValue = Math.max(0, parsedValue - value);
    dom.setStyle(element, indentStyleName, styleValue ? styleValue + unit : '');
  } else {
    const styleValue = (parsedValue + value) + unit;
    dom.setStyle(element, indentStyleName, styleValue);
  }
};

const validateBlocks = (editor: Editor, blocks: SugarElement<HTMLElement>[]): boolean =>
  Arr.forall(blocks, (block) => {
    const indentStyleName = getIndentStyleName(Options.shouldIndentUseMargin(editor), block);
    const intentValue = Css.getRaw(block, indentStyleName).map(parseIndentValue).getOr(0);
    const contentEditable = editor.dom.getContentEditable(block.dom);
    return contentEditable !== 'false' && intentValue > 0;
  });

const canOutdent = (editor: Editor): boolean => {
  const blocks = getBlocksToIndent(editor);
  return !editor.mode.isReadOnly() && (blocks.length > 1 || validateBlocks(editor, blocks));
};

const isListComponent = (el: SugarElement<Node>): boolean =>
  isList(el) || isListItem(el);

const parentIsListComponent = (el: SugarElement<Node>): boolean =>
  Traverse.parent(el).exists(isListComponent);

const getBlocksToIndent = (editor: Editor): SugarElement<HTMLElement>[] =>
  Arr.filter(SugarElements.fromDom(editor.selection.getSelectedBlocks()), (el): el is SugarElement<HTMLElement> =>
    !isListComponent(el) && !parentIsListComponent(el) && isEditable(el)
  );

const handle = (editor: Editor, command: string): void => {
  const { dom } = editor;
  const indentation = Options.getIndentation(editor);
  const indentUnit = /[a-z%]+$/i.exec(indentation)?.[0] ?? 'px';
  const indentValue = parseIndentValue(indentation);
  const useMargin = Options.shouldIndentUseMargin(editor);

  Arr.each(getBlocksToIndent(editor), (block) => {
    indentElement(dom, command, useMargin, indentValue, indentUnit, block.dom);
  });
};

const indent = (editor: Editor): void => handle(editor, 'indent');
const outdent = (editor: Editor): void => handle(editor, 'outdent');

export {
  canOutdent,
  indent,
  outdent
};
