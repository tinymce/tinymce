import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import HtmlSerializer from '../api/html/Serializer';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import * as CaretFinder from '../caret/CaretFinder';
import { isWsPreserveElement } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as EditorFocus from '../focus/EditorFocus';
import * as FilterNode from '../html/FilterNode';
import * as Zwsp from '../text/Zwsp';
import { Content, isTreeNode, SetContentArgs, SetContentResult } from './ContentTypes';

const moveSelection = (editor: Editor): void => {
  if (EditorFocus.hasFocus(editor)) {
    CaretFinder.firstPositionIn(editor.getBody()).each((pos) => {
      const node = pos.getNode();
      const caretPos = NodeType.isTable(node) ? CaretFinder.firstPositionIn(node).getOr(pos) : pos;
      editor.selection.setRng(caretPos.toRange());
    });
  }
};

const setEditorHtml = (editor: Editor, html: string, noSelection: boolean | undefined): void => {
  editor.dom.setHTML(editor.getBody(), html);
  if (noSelection !== true) {
    moveSelection(editor);
  }
};

const setContentString = (editor: Editor, body: HTMLElement, content: string, args: SetContentArgs): SetContentResult => {
  // TINY-10305: Remove all user-input zwsp to avoid impacting caret removal from content.
  content = Zwsp.trim(content);

  // Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
  // It will also be impossible to place the caret in the editor unless there is a BR element present
  if (content.length === 0 || /^\s+$/.test(content)) {
    const padd = '<br data-mce-bogus="1">';

    // Todo: There is a lot more root elements that need special padding
    // so separate this and add all of them at some point.
    if (body.nodeName === 'TABLE') {
      content = '<tr><td>' + padd + '</td></tr>';
    } else if (/^(UL|OL)$/.test(body.nodeName)) {
      content = '<li>' + padd + '</li>';
    }

    const forcedRootBlockName = Options.getForcedRootBlock(editor);

    // Check if forcedRootBlock is a valid child of the body
    if (editor.schema.isValidChild(body.nodeName.toLowerCase(), forcedRootBlockName.toLowerCase())) {
      content = padd;
      content = editor.dom.createHTML(forcedRootBlockName, Options.getForcedRootBlockAttrs(editor), content);
    } else if (!content) {
      content = padd;
    }

    setEditorHtml(editor, content, args.no_selection);

    return { content, html: content };
  } else {
    if (args.format !== 'raw') {
      content = HtmlSerializer({ validate: false }, editor.schema).serialize(
        editor.parser.parse(content, { isRootContent: true, insert: true })
      );
    }

    const trimmedHtml = isWsPreserveElement(SugarElement.fromDom(body)) ? content : Tools.trim(content);
    setEditorHtml(editor, trimmedHtml, args.no_selection);

    return { content: trimmedHtml, html: trimmedHtml };
  }
};

const setContentTree = (editor: Editor, body: HTMLElement, content: AstNode, args: SetContentArgs): SetContentResult => {
  FilterNode.filter(editor.parser.getNodeFilters(), editor.parser.getAttributeFilters(), content);

  const html = HtmlSerializer({ validate: false }, editor.schema).serialize(content);

  // TINY-10305: Remove all user-input zwsp to avoid impacting caret removal from content.
  const trimmedHtml = Zwsp.trim(isWsPreserveElement(SugarElement.fromDom(body)) ? html : Tools.trim(html));
  setEditorHtml(editor, trimmedHtml, args.no_selection);

  return { content, html: trimmedHtml };
};

export const setContentInternal = (editor: Editor, content: Content, args: SetContentArgs): SetContentResult => {
  return Optional.from(editor.getBody()).map((body) => {
    if (isTreeNode(content)) {
      return setContentTree(editor, body, content, args);
    } else {
      return setContentString(editor, body, content, args);
    }
  }).getOr({ content, html: isTreeNode(args.content) ? '' : args.content });
};
