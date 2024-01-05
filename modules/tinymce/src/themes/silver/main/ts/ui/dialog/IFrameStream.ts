import { Arr, Optional, Strings, Throttler, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement } from '@ephox/sugar';

const browser = PlatformDetection.detect().browser;
const isSafari = browser.isSafari();
const isChromium = browser.isChromium();

const isElementScrollAtBottom = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement) =>
  Math.ceil(scrollTop) + clientHeight >= scrollHeight;

const scrollToY = (win: Window, y: number | 'bottom') =>
  // TINY-10128: The iframe body is occasionally null when we attempt to scroll, so instead of using body.scrollHeight, use a
  // fallback value of 99999999. To minimise the potential impact of future browser changes, this fallback is significantly smaller
  // than the minimum of the maximum value Window.scrollTo would take on supported browsers:
  // Chromium: > Number.MAX_SAFE_INTEGER
  // Safari: 2^31 - 1 = 2147483647
  // Firefox: 2147483583
  win.scrollTo(0, y === 'bottom' ? 99999999 : y);

const getScrollingElement = (doc: Document, html: string): Optional<HTMLElement> => {
  // TINY-10110: The scrolling element can change between body and documentElement depending on whether there
  // is a doctype declaration. However, this behavior is inconsistent on Chrome and Safari so checking for
  // the scroll properties is the most reliable way to determine which element is the scrolling element, at
  // least for the purposes of determining whether scroll is at bottom.
  const body = doc.body;
  return Optional.from(!/^<!DOCTYPE (html|HTML)/.test(html) &&
      (!isChromium && !isSafari || Type.isNonNullable(body) && (body.scrollTop !== 0 || Math.abs(body.scrollHeight - body.clientHeight) > 1))
    ? body : doc.documentElement);
};

const parser = new DOMParser();
const parse = (html: string): HTMLElement =>
  parser.parseFromString(html, 'text/html').body;

const shallowClone = (elm: Node): Node =>
  elm.cloneNode(false);

const isShallowEqual = (a: Node, b: Node): boolean =>
  shallowClone(a).isEqualNode(shallowClone(b));

const replaceNode = (node: Node, replacement: Node): void => {
  if (node.nodeType === Node.ELEMENT_NODE) {
    (node as Element).replaceWith(replacement);
  } else {
    node.parentNode?.replaceChild(replacement, node);
  }
};

const getChildNodes = (elm: Node): Node[] => Array.from(elm.childNodes);

const applyUpdate = (current: Node, updated: Node): void => {
  const queue: [Node, Node][] = [[ current, updated ]];
  while (queue.length > 0) {
    const level = queue.shift();
    if (Type.isUndefined(level)) {
      // TINY-10106: Should never happen but break to avoid infinite loop.
      break;
    }

    const [ currentNode, updatedNode ] = level;
    if (!isShallowEqual(currentNode, updatedNode)) {
      replaceNode(currentNode, updatedNode);
      // TINY-10106: No need to continue traversing down the path as we have already replaced the mismatched node.
      continue;
    }

    const currentChildren = getChildNodes(currentNode);
    const updatedChildren = getChildNodes(updatedNode);

    const maxLength = Math.max(currentChildren.length, updatedChildren.length);
    for (let i = 0; i < maxLength; i++) {
      const currentChild = Arr.get(currentChildren, i);
      const newChild = Arr.get(updatedChildren, i);
      currentChild.fold(
        () => newChild.each((n) => {
          currentNode.appendChild(n);
          currentChildren.push(n);
        }),
        (c) => newChild.each((n) => {
          queue.push([ c, n ]);
        })
      );
    }
  }
};

const update = (iframeElement: SugarElement<HTMLIFrameElement>, html: string, fallbackFn: () => void) => {
  const iframe = iframeElement.dom;
  Optional.from(iframe.contentDocument).fold(
    fallbackFn,
    (doc) => {
      // TINY-10032: If documentElement (or body) is nullable, we assume document is empty and so scroll is at bottom.
      const isScrollAtBottom = getScrollingElement(doc, html).forall(isElementScrollAtBottom);

      const scrollAfterUpdate = (): void => {
        const win = iframe.contentWindow;
        if (Type.isNonNullable(win) && isScrollAtBottom) {
          scrollToY(win, 'bottom');
        }
      };

      if (Strings.isEmpty(doc.body.innerHTML)) {
        // TINY-10106: applyUpdate only updates nodes in the body. However, in practice, we also need to include elements in the head. This usually only needs to be
        // done once to load content CSS and other metadata. So when the iframe body is empty (which should be the first time we update), we use document.write to
        // ensure head elements from the HTML are also applied to the iframe.
        doc.open();
        doc.write(html);
        doc.close();
      } else {
        applyUpdate(doc.body, parse(html));
      }
      scrollAfterUpdate();
    });
};

// TINY-10078: Use Throttler.adaptable to ensure that any content added during the waiting period is not lost.
// TINY-10106: Throttle to avoid rapid update requests affecting performance.
const throttler = Throttler.adaptable(update, 10);
const throttledUpdate = throttler.throttle;

export {
  throttledUpdate
};
