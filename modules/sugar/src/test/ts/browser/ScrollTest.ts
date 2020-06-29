import { assert, UnitTest } from '@ephox/bedrock-client';
import { Document, HTMLElement, HTMLIFrameElement, Window } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Location from 'ephox/sugar/api/view/Location';
import * as Scroll from 'ephox/sugar/api/view/Scroll';
import * as Width from 'ephox/sugar/api/view/Width';

interface TestDocSpec {
  iframe: Element<HTMLIFrameElement>;
  rawWin: Window;
  rawDoc: Element<Document>;
  html: Element<HTMLElement>;
  body: Element<HTMLElement>;
  rtl: boolean;
  dir: string;
  byId: (str: string) => Element<HTMLElement>;
}

type AttrMap = Record<string, string | boolean | number>;
interface TestAttrMap {
  iframe: AttrMap;
  html: Option<AttrMap>;
  body: Option<AttrMap>;
}

UnitTest.asynctest('ScrollTest', (success, failure) => {
  const platform = PlatformDetection.detect();

  if (!Math.sign) { // For IE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
    Math.sign = (x) => {
      const a = x > 0 ? 1 : 0;
      const b = x < 0 ? 1 : 0;
      return (a - b) || +x;
    };
  }

  const testOne = (i: string, attrMap: TestAttrMap, next: () => void) => {
    const iframe = Element.fromHtml<HTMLIFrameElement>(i);
    Attr.setAll(iframe, attrMap.iframe);
    const run = DomEvent.bind(iframe, 'load', () => {
      run.unbind();
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const iframeWin = iframe.dom().contentWindow!;
        const iframeDoc = iframeWin.document;
        const html = Element.fromDom(iframeDoc.documentElement);
        const body = Element.fromDom(iframeDoc.body);
        attrMap.html.each(Fun.curry(Attr.setAll, html));
        attrMap.body.each(Fun.curry(Attr.setAll, body));
        const doc: TestDocSpec = {
          iframe,
          rawWin: iframeWin,
          rawDoc: Element.fromDom(iframeDoc),
          body,
          html,
          rtl: iframeDoc.body.dir === 'rtl',
          dir: Attr.get(body, 'dir') || 'ltr',
          byId(str) {
            return Option.from(iframeDoc.getElementById(str))
              .map(Element.fromDom)
              .getOrDie('cannot find element with id ' + str);
          }
        };
        runTests(doc);
        Remove.remove(iframe);
        next();
      } catch (e) {
        // Remove.remove(iframe);
        failure(e);
      }
    });
    Insert.append(Body.body(), iframe);
  };

  const ifr = '<iframe src="/project/@ephox/sugar/src/test/data/scrollTest.html"></iframe>';
  testOne(ifr, { // vanilla iframe
    iframe: { id: 'vanilla', style: 'height:200px; width:500px; border: 7px dotted chartreuse;' },
    html: Option.none(),
    body: Option.some<AttrMap>({ contenteditable: 'true', style: 'margin: 0; padding: 5px;' })
  },
  () => {
    testOne(ifr, { // rtl iframe
      iframe: { id: 'rtl', style: 'height:200px; width:500px; border: 7px solid blueviolet;' },
      html: Option.none(),
      body: Option.some<AttrMap>({ dir: 'rtl', contenteditable: 'true', style: 'margin: 0; padding: 5px;' })
    },
    success);
  });

  const within = (a: number, b: number, eps: number) => Math.abs(a - b) <= eps;

  // check current scroll position is at (x,y) (or within +/- (epsX, epsY))
  const scrollCheck = (x: number, y: number, epsX: number, epsY: number, doc: TestDocSpec, msg: string) => {
    Css.reflow(doc.body);
    const scr = Scroll.get(doc.rawDoc);
    assert.eq(true, within(x, scr.left(), epsX), msg + ' (' + doc.dir + ') Expected scrollCheck x=' + x + ', got=' + scr.left() + ', eps=' + epsX);
    assert.eq(true, within(y, scr.top(), epsY), msg + ' (' + doc.dir + ') Expected scrollCheck y=' + y + ', got=' + scr.top() + ', eps=' + epsY);
  };

  // scroll to (x,y) and check position
  const scrollTo = (x: number, y: number, doc: TestDocSpec) => {
    Scroll.to(x, y, doc.rawDoc);
    scrollCheck(x, y, 0, 0, doc, 'scrollTo(' + x + ',' + y + ')');
  };

  // set the scroll to location of element 'el' and check position
  const setToElement = (doc: TestDocSpec, el: Element<HTMLElement>, x: number, y: number, epsX: number, epsY: number, msg: string) => {
    Scroll.setToElement(doc.rawWin, el);
    scrollCheck(x, y, epsX, epsY, doc, msg);
  };

  const scrollBy = (x: number, y: number, doc: TestDocSpec, msg: string) => {
    const scr0 = Scroll.get(doc.rawDoc);
    Scroll.by(x, y, doc.rawDoc);
    scrollCheck(scr0.left() + x, scr0.top() + y, 0, 0, doc, 'scrollBy(' + x + ',' + y + '): ' + msg);
  };

  const runTests = (doc: TestDocSpec) => {
    const mar0 = Css.get(doc.html, 'margin');
    const bod0 = Css.get(doc.body, 'border');
    const bodyBorder = parseInt(bod0 || '', 10) || 0;
    const mar = parseInt(mar0 || '', 10) || 0;
    const hgt = doc.body.dom().scrollHeight;
    const scrollBarWidth = Scroll.scrollBarWidth();
    const cEl = doc.byId('centre1');
    const center = Location.absolute(cEl);
    const cX = Math.round(center.left());
    const cY = Math.round(center.top());

    assert.eq(true, scrollBarWidth > 5 && scrollBarWidth < 50 || (platform.os.isOSX() && scrollBarWidth === 0), 'scroll bar width, got=' + scrollBarWidth);

    scrollCheck(0, 0, 0, 0, doc, 'start pos');

    //  TBIO-5131 - skip tests for IE and EDGE RTL (x coords go -ve from left to right on the screen in RTL mode)
    if ( !(doc.rtl && (platform.browser.isIE() || platform.browser.isEdge())) ) {

      const cPos = Location.absolute(cEl);
      setToElement(doc, cEl, cPos.left(), cPos.top(), 1, 1, 'set to centre el');

      // scroll text of the centre cell into view (right-aligned in RTL mode)
      const x = cX + (doc.rtl ? (Width.get(cEl) - Width.get(doc.iframe)) : 0);
      scrollTo(x, cY, doc); // scroll back to centre

      scrollBy(-50, 30, doc, 'scrollBy/1');
      scrollBy(50, -30, doc, 'scrollBy/2');

      scrollCheck(x, cY, 0, 0, doc, 'reset/2');

      // scroll to top el
      const pos = Location.absolute(doc.byId('top1'));
      setToElement(doc, doc.byId('top1'), pos.left(), pos.top(), 0, 0, 'set to top');

      scrollTo(x, cY, doc); // scroll back to centre

      // scroll to bottom el
      const bot1Pos = Location.absolute(doc.byId('top1'));
      const bot = hgt + 2 * bodyBorder + 2 * mar - (doc.rawWin.innerHeight - scrollBarWidth); // content height minus viewport-excluding-the-bottom-scrollbar
      setToElement(doc, doc.byId('bot1'), bot1Pos.left(), bot, 0, 20, 'set to bottom');

      scrollTo(x, cY, doc); // scroll back to centre
      Scroll.preserve(doc.rawDoc, () => {
        scrollBy( 100, 100, doc, 'scroll 1'); // scroll some where else
      });
      scrollCheck(x, cY, 0, 0, doc, 'preserve'); // scroll back at centre

      const c1 = Scroll.capture(doc.rawDoc);
      scrollBy( 100, 100, doc, 'scroll 2'); // scroll some where else
      c1.restore();
      scrollCheck(x, cY, 0, 0, doc, 'restore #1');
      scrollBy( -100, -100, doc, 'scroll 3');
      c1.save();
      scrollBy(50, 50, doc, 'scroll 4');
      c1.restore();
      scrollCheck(x - 100, cY - 100, 0, 0, doc, 'restore #2');
    }
  };
});
