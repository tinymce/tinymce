/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SelectorFilter, SugarElement } from '@ephox/sugar';

import DomQuery from '../api/dom/DomQuery';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import Delay from '../api/util/Delay';
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

const browser = PlatformDetection.detect().browser;

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
        sibling.parentNode.removeChild(sibling);
      } else {
        sibling.deleteData(data.length - 1, 1);
      }
    }

    sibling = node.nextSibling;
    if (CaretContainer.startsWithCaretContainer(sibling)) {
      const data = sibling.data;

      if (data.length === 1) {
        sibling.parentNode.removeChild(sibling);
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
  const rootBlock = Settings.getForcedRootBlock(editor);
  const caretBlock = rootBlock.length > 0 ? rootBlock : 'p';

  const show = (before: boolean, element: Element): Range | null => {
    let rng: Range;

    hide();

    if (isTableCell(element)) {
      return null;
    }

    if (isBlock(element)) {
      caretContainerNode = CaretContainer.insertBlock(caretBlock, element, before);
      const clientRect = getAbsoluteClientRect(root, element, before);
      DomQuery(caretContainerNode).css('top', clientRect.top);

      const caret = DomQuery<HTMLElement>('<div class="mce-visual-caret" data-mce-bogus="all"></div>').css({ ...clientRect }).appendTo(root)[0];
      lastVisualCaret.set({ caret, element, before });

      if (before) {
        DomQuery(caret).addClass('mce-visual-caret-before');
      }
      startBlink();

      rng = element.ownerDocument.createRange();
      rng.setStart(caretContainerNode, 0);
      rng.setEnd(caretContainerNode, 0);
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
      DomQuery(caretState.caret).remove();
      lastVisualCaret.clear();
    });

    if (cursorInterval) {
      Delay.clearInterval(cursorInterval);
      cursorInterval = undefined;
    }
  };

  const startBlink = () => {
    cursorInterval = Delay.setInterval(() => {
      if (hasFocus()) {
        DomQuery('div.mce-visual-caret', root).toggleClass('mce-visual-caret-hidden');
      } else {
        DomQuery('div.mce-visual-caret', root).addClass('mce-visual-caret-hidden');
      }
    }, 500);
  };

  const reposition = () => {
    lastVisualCaret.on((caretState) => {
      const clientRect = getAbsoluteClientRect(root, caretState.element, caretState.before);
      DomQuery(caretState.caret).css({ ...clientRect });
    });
  };

  const destroy = () => Delay.clearInterval(cursorInterval);

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

export const isFakeCaretTableBrowser = (): boolean => browser.isIE() || browser.isEdge() || browser.isFirefox();

export const isInlineFakeCaretTarget = (node: Node): node is HTMLElement =>
  isContentEditableFalse(node) || isMedia(node);

export const isFakeCaretTarget = (node: Node): node is HTMLElement =>
  isInlineFakeCaretTarget(node) || (NodeType.isTable(node) && isFakeCaretTableBrowser());
