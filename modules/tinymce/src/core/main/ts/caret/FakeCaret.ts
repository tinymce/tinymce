import { Singleton } from '@ephox/katamari';
import { ContentEditable, SelectorFilter, SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Options from '../api/Options';
import * as NodeType from '../dom/NodeType';
import * as ClientRect from '../geom/ClientRect';
import * as CaretContainer from './CaretContainer';
import * as CaretContainerRemove from './CaretContainerRemove';

type GeomClientRect = ClientRect.ClientRect;

export interface FakeCaret {
  show: (before: boolean, element: Element) => Range | null;
  hide: () => void;
  getCss: () => string;
  reposition: () => void;
  destroy: () => void;
}

interface CaretState {
  caret: HTMLElement;
  element: HTMLElement;
  before: boolean;
}

const isContentEditableFalse = NodeType.isContentEditableFalse;
const isMedia = NodeType.isMedia;
const isTableCell = NodeType.isTableCell;
const inlineFakeCaretSelector = '*[contentEditable=false],video,audio,embed,object';

const getAbsoluteClientRect = (root: HTMLElement, element: HTMLElement, before: boolean): GeomClientRect => {
  const clientRect = ClientRect.collapse(element.getBoundingClientRect(), before);
  let scrollX: number;
  let scrollY: number;

  if (root.tagName === 'BODY') {
    const docElm = root.ownerDocument.documentElement;
    scrollX = root.scrollLeft || docElm.scrollLeft;
    scrollY = root.scrollTop || docElm.scrollTop;
  } else {
    const rootRect = root.getBoundingClientRect();
    scrollX = root.scrollLeft - rootRect.left;
    scrollY = root.scrollTop - rootRect.top;
  }

  clientRect.left += scrollX;
  clientRect.right += scrollX;
  clientRect.top += scrollY;
  clientRect.bottom += scrollY;
  clientRect.width = 1;

  let margin = element.offsetWidth - element.clientWidth;

  if (margin > 0) {
    if (before) {
      margin *= -1;
    }

    clientRect.left += margin;
    clientRect.right += margin;
  }

  return clientRect;
};

const trimInlineCaretContainers = (root: HTMLElement): void => {
  const fakeCaretTargetNodes = SelectorFilter.descendants(SugarElement.fromDom(root), inlineFakeCaretSelector);
  for (let i = 0; i < fakeCaretTargetNodes.length; i++) {
    const node = fakeCaretTargetNodes[i].dom;

    let sibling = node.previousSibling;
    if (CaretContainer.endsWithCaretContainer(sibling)) {
      const data = sibling.data;

      if (data.length === 1) {
        sibling.parentNode?.removeChild(sibling);
      } else {
        sibling.deleteData(data.length - 1, 1);
      }
    }

    sibling = node.nextSibling;
    if (CaretContainer.startsWithCaretContainer(sibling)) {
      const data = sibling.data;

      if (data.length === 1) {
        sibling.parentNode?.removeChild(sibling);
      } else {
        sibling.deleteData(0, 1);
      }
    }
  }
};

export const FakeCaret = (editor: Editor, root: HTMLElement, isBlock: (node: Node) => node is HTMLElement, hasFocus: () => boolean): FakeCaret => {
  const lastVisualCaret = Singleton.value<CaretState>();
  let cursorInterval: number | undefined;
  let caretContainerNode: Node | null;
  const caretBlock = Options.getForcedRootBlock(editor);
  const dom = editor.dom;

  const show = (before: boolean, element: Element): Range | null => {
    let rng: Range;

    hide();

    if (isTableCell(element)) {
      return null;
    }

    if (isBlock(element)) {
      const caretContainer = CaretContainer.insertBlock(caretBlock, element, before);
      const clientRect = getAbsoluteClientRect(root, element, before);
      dom.setStyle(caretContainer, 'top', clientRect.top);
      caretContainerNode = caretContainer;

      const caret = dom.create('div', { 'class': 'mce-visual-caret', 'data-mce-bogus': 'all' });
      dom.setStyles(caret, { ...clientRect });
      dom.add(root, caret);
      lastVisualCaret.set({ caret, element, before });

      if (before) {
        dom.addClass(caret, 'mce-visual-caret-before');
      }
      startBlink();

      rng = element.ownerDocument.createRange();
      rng.setStart(caretContainer, 0);
      rng.setEnd(caretContainer, 0);
    } else {
      caretContainerNode = CaretContainer.insertInline(element, before);
      rng = element.ownerDocument.createRange();

      if (isInlineFakeCaretTarget(caretContainerNode.nextSibling)) {
        rng.setStart(caretContainerNode, 0);
        rng.setEnd(caretContainerNode, 0);
      } else {
        rng.setStart(caretContainerNode, 1);
        rng.setEnd(caretContainerNode, 1);
      }

      return rng;
    }

    return rng;
  };

  const hide = () => {
    // TODO: TINY-6015 - Ensure cleaning up the fake caret preserves the selection, as currently
    //  the CaretContainerRemove.remove below will change the selection in some cases
    trimInlineCaretContainers(root);

    if (caretContainerNode) {
      CaretContainerRemove.remove(caretContainerNode);
      caretContainerNode = null;
    }

    lastVisualCaret.on((caretState) => {
      dom.remove(caretState.caret);
      lastVisualCaret.clear();
    });

    if (cursorInterval) {
      clearInterval(cursorInterval);
      cursorInterval = undefined;
    }
  };

  const startBlink = () => {
    cursorInterval = setInterval(() => {
      lastVisualCaret.on((caretState) => {
        if (hasFocus()) {
          dom.toggleClass(caretState.caret, 'mce-visual-caret-hidden');
        } else {
          dom.addClass(caretState.caret, 'mce-visual-caret-hidden');
        }
      });
    }, 500);
  };

  const reposition = () => {
    lastVisualCaret.on((caretState) => {
      const clientRect = getAbsoluteClientRect(root, caretState.element, caretState.before);
      dom.setStyles(caretState.caret, { ...clientRect });
    });
  };

  const destroy = () => clearInterval(cursorInterval);

  const getCss = () => (
    '.mce-visual-caret {' +
      'position: absolute;' +
      'background-color: black;' +
      'background-color: currentcolor;' +
      // 'background-color: red;' +
      '}' +
      '.mce-visual-caret-hidden {' +
      'display: none;' +
      '}' +
      '*[data-mce-caret] {' +
      'position: absolute;' +
      'left: -1000px;' +
      'right: auto;' +
      'top: 0;' +
      'margin: 0;' +
      'padding: 0;' +
      '}'
  );

  return {
    show,
    hide,
    getCss,
    reposition,
    destroy
  };
};

export const isFakeCaretTableBrowser = (): boolean => Env.browser.isFirefox();

export const isInlineFakeCaretTarget = (node: Node | undefined | null): node is HTMLElement =>
  isContentEditableFalse(node) || isMedia(node);

export const isFakeCaretTarget = (node: Node | undefined | null): node is HTMLElement => {
  const isTarget = isInlineFakeCaretTarget(node) || (NodeType.isTable(node) && isFakeCaretTableBrowser());
  return isTarget && Traverse.parentElement(SugarElement.fromDom(node)).exists(ContentEditable.isEditable);
};
