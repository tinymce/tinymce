import { Arr, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

const browser = PlatformDetection.detect().browser;

const firstElement = (nodes: SugarElement<Node>[]): Optional<SugarElement<HTMLElement>> =>
  Arr.find(nodes, SugarNode.isElement) as Optional<SugarElement<HTMLElement>>;

// Firefox has a bug where caption height is not included correctly in offset calculations of tables
// this tries to compensate for that by detecting if that offsets are incorrect and then remove the height
const getTableCaptionDeltaY = (elm: SugarElement<Node>) => {
  if (browser.isFirefox() && SugarNode.name(elm) === 'table') {
    return firstElement(Traverse.children(elm)).filter((elm) => {
      return SugarNode.name(elm) === 'caption';
    }).bind((caption) => {
      return firstElement(Traverse.nextSiblings(caption)).map((body) => {
        const bodyTop = body.dom.offsetTop;
        const captionTop = caption.dom.offsetTop;
        const captionHeight = caption.dom.offsetHeight;
        return bodyTop <= captionTop ? -captionHeight : 0;
      });
    }).getOr(0);
  } else {
    return 0;
  }
};

const hasChild = (elm: Element, child: Node) => elm.children && Arr.contains(elm.children, child);

const getPos = (body: HTMLElement, elm: Element | null, rootElm?: Node): { x: number; y: number } => {
  let x = 0, y = 0;
  const doc = body.ownerDocument;

  rootElm = rootElm ? rootElm : body;

  if (elm) {
    // Use getBoundingClientRect if it exists since it's faster than looping offset nodes
    // Fallback to offsetParent calculations if the body isn't static better since it stops at the body root
    if (rootElm === body && elm.getBoundingClientRect && Css.get(SugarElement.fromDom(body), 'position') === 'static') {
      const pos = elm.getBoundingClientRect();

      // Add scroll offsets from documentElement or body since IE with the wrong box model will use d.body and so do WebKit
      // Also remove the body/documentelement clientTop/clientLeft on IE 6, 7 since they offset the position
      x = pos.left + (doc.documentElement.scrollLeft || body.scrollLeft) - doc.documentElement.clientLeft;
      y = pos.top + (doc.documentElement.scrollTop || body.scrollTop) - doc.documentElement.clientTop;

      return { x, y };
    }

    let offsetParent: Element | null = elm;
    while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType && !hasChild(offsetParent, rootElm)) {
      const castOffsetParent = offsetParent as HTMLElement;
      x += castOffsetParent.offsetLeft || 0;
      y += castOffsetParent.offsetTop || 0;
      offsetParent = castOffsetParent.offsetParent;
    }

    offsetParent = elm.parentNode as Element;
    while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType && !hasChild(offsetParent, rootElm)) {
      x -= offsetParent.scrollLeft || 0;
      y -= offsetParent.scrollTop || 0;
      offsetParent = offsetParent.parentNode as Element;
    }

    y += getTableCaptionDeltaY(SugarElement.fromDom(elm));
  }

  return { x, y };
};

export {
  getPos
};
