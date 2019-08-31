import { assert, UnitTest } from '@ephox/bedrock';
import { console, HTMLIFrameElement } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import { Traverse } from 'ephox/sugar/api/Main';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Location from 'ephox/sugar/api/view/Location';
import * as Scroll from 'ephox/sugar/api/view/Scroll';

UnitTest.asynctest('LocationTest', (success, failure) => {
  const platform = PlatformDetection.detect();
  const scrollBarWidth = Scroll.scrollBarWidth();

  const leftScrollBarWidth = (doc) => {
    // Tries to detect the width of the left scrollbar by checking the offsetLeft of the documentElement
    // Chrome adds the scrollbar to the left in rtl mode as of Chrome 70+
    return Location.relative(Traverse.documentElement(doc.body)).left();
  };

  const asserteq = function (expected, actual, message) {
    // I wish assert.eq printed expected and actual on failure
    const m = message === undefined ? undefined : 'expected ' + expected + ', was ' + actual + ': ' + message;
    assert.eq(expected, actual, m);
  };

  const testOne = function (i, attrMap, next) {
    const iframe = Element.fromHtml<HTMLIFrameElement>(i);
    Attr.setAll(iframe, attrMap.iframe);

    const run = DomEvent.bind(iframe, 'load', function () {
      run.unbind();
      try {
        const iframeWin = iframe.dom().contentWindow;
        const iframeDoc = iframeWin.document;
        const html = Element.fromDom(iframeDoc.documentElement);
        const body = Element.fromDom(iframeDoc.body);
        attrMap.html.each(Fun.curry(Attr.setAll, html));
        attrMap.body.each(Fun.curry(Attr.setAll, body));
        const doc = {
          iframe,
          rawWin: iframeWin,
          rawDoc: Element.fromDom(iframeDoc),
          body,
          rtl: iframeDoc.body.dir === 'rtl',
          dir: Attr.get(body, 'dir') || 'ltr',
          byId (str) {
            return Option.from(iframeDoc.getElementById(str))
              .map(Element.fromDom)
              .getOrDie('cannot find element with id ' + str);
          }
        };

        checks(doc);
        Remove.remove(iframe);
        next();
      } catch (e) {
        // Remove.remove(iframe);
        failure(e);
      }
    });

    Insert.append(Body.body(), iframe);
  };

  const ifr = '<iframe src="/project/@ephox/sugar/src/test/data/locationTest.html"></iframe>';

  testOne(ifr, { // vanilla iframe
    iframe: { id: 'vanilla', style: 'height:200px; width:500px; border: 1px dashed chartreuse;' },
    html: Option.none(),
    body: Option.some({ contenteditable: 'true', style: 'margin: 0; padding: 5px;' })
  },
    function () {
      testOne(ifr, { // rtl iframe
        iframe: { id: 'ifrRtl', style: 'height:200px; width:500px; border: 1px dashed turquoise;' },
        html: Option.none(),
        body: Option.some({ dir: 'rtl', contenteditable: 'true', style: 'margin: 0; padding: 5px;' })
      },
        success);
    });

  const checks = function (doc) {

    Arr.each([
      baseChecks,
      disconnectedChecks,
      absoluteChecks,
      relativeChecks,
      staticChecks,
      tableChecks,
      fixedChecks, // recommend making these last, as they adjust the iframe scroll
      bodyChecks
    ], function (f) {
      f(doc);
    });
  };

  const baseChecks = function () {
    // these checks actually depend on the tunic stylesheet. They might not actually be useful.
    const body = Body.body();
    let pos = Location.absolute(body);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.relative(body);
    assert.eq(0, pos.top()); // JQuery doesn't return 0, but this makes more sense
    assert.eq(0, pos.left());
    pos = Location.viewport(body);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    assert.eq(true, scrollBarWidth > 5 && scrollBarWidth < 50 || (platform.os.isOSX() && scrollBarWidth === 0), 'scroll bar width, got=' + scrollBarWidth);
  };

  const disconnectedChecks = function () {
    const div = Element.fromTag('div');
    let pos = Location.absolute(div);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.relative(div);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.viewport(div);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
  };

  const absoluteChecks = function (doc) {
    const leftScrollW = leftScrollBarWidth(doc);

    // This one has position absolute, but no values set initially
    Css.setAll(doc.byId('positionTest'), { top: '10px', left: '10px' });
    // GUESS: 1px differences from JQuery is due to the 1px margin on the body

    const tests = [
      {
        id: 'absolute-1',
        absolute: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } },
        relative: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } }, // JQuery returns 0/0
        viewport: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } }
      },
      {
        id: 'absolute-1-1',
        absolute: { top: 5, left: { ltr: 5, rtl: 5 + leftScrollW } },
        relative: { top: 2, left: { ltr: 2, rtl: 2 } }, // JQuery returns 1/1
        viewport: { top: 5, left: { ltr: 5, rtl: 5 + leftScrollW } }
      },
      {
        id: 'absolute-1-1-1',
        absolute: { top: 9, left: { ltr: 9, rtl: 9 + leftScrollW } },
        relative: { top: 2, left: { ltr: 2, rtl: 2 } }, // JQuery returns 1/1
        viewport: { top: 9, left: { ltr: 9, rtl: 9 + leftScrollW } }
      },
      {
        id: 'absolute-2',
        absolute: { top: 20, left: { ltr: 20, rtl: 20 + leftScrollW } },
        relative: { top: 20, left: { ltr: 20, rtl: 20 + leftScrollW } }, // JQuery returns 19/19
        viewport: { top: 20, left: { ltr: 20, rtl: 20 + leftScrollW } }
      },
      {
        id: 'positionTest',
        absolute: { top: 10, left: { ltr: 10, rtl: 10 + leftScrollW } },
        relative: { top: 10, left: { ltr: 10, rtl: 10 + leftScrollW } },
        viewport: { top: 10, left: { ltr: 10, rtl: 10 + leftScrollW } }
      }
    ];

    runChecks(doc, tests);
  };

  const relativeChecks = function (doc) {
    const leftScrollW = leftScrollBarWidth(doc);

    // GUESS: 1px differences from JQuery is due to the 1px margin on the body

    const tests = [
      {
        id: 'relative-1',
        absolute: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } },
        relative: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns 6/6
        viewport: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'relative-1-1',
        absolute: { top: 14, left: { ltr: 14, rtl: 372 - scrollBarWidth + leftScrollW } },
        relative: { top: 6, left: { ltr: 6, rtl: -10 } }, // JQuery returns 5/5
        viewport: { top: 14, left: { ltr: 14, rtl: 372 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'relative-1-1-1',
        absolute: { top: 22, left: { ltr: 22, rtl: 364 - scrollBarWidth + leftScrollW } },
        relative: { top: 6, left: { ltr: 6, rtl: -10 } }, // JQuery returns 5/5
        viewport: { top: 22, left: { ltr: 22, rtl: 364 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'relative-2',
        absolute: { top: 141, left: { ltr: 26, rtl: 400 - scrollBarWidth + leftScrollW } },
        relative: { top: 141, left: { ltr: 26, rtl: 400 - scrollBarWidth } }, // JQuery returns 141/26
        viewport: { top: 141, left: { ltr: 26, rtl: 400 - scrollBarWidth + leftScrollW } }
      },

      // This simulates a docked ego state for the toolbars
      {
        id: 'relative-toolbar-container',
        absolute: { top: 684, left: { ltr: 5, rtl: 395 - scrollBarWidth + leftScrollW } },
        relative: { top: 684, left: { ltr: 5, rtl: 395 - scrollBarWidth } },
        viewport: { top: 684, left: { ltr: 5, rtl: 395 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'relative-toolbar',
        absolute: { top: 684 - 40, left: { ltr: 5, rtl: 395 - scrollBarWidth + leftScrollW } },
        relative: { top: -40, left: { ltr: 0, rtl: 0 } },
        viewport: { top: 684 - 40, left: { ltr: 5, rtl: 395 - scrollBarWidth + leftScrollW } }
      }
    ];

    runChecks(doc, tests);
  };

  const staticChecks = function (doc) {
    const leftScrollW = leftScrollBarWidth(doc);

    const extraHeight = 230; // because all tests are in one page
    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    const tests = [
      {
        id: 'static-1',
        absolute: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } },
        relative: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns +6/6
        viewport: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'static-1-1',
        absolute: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 - scrollBarWidth + leftScrollW } },
        relative: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 - scrollBarWidth } }, // JQuery returns +14/14
        viewport: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'static-1-1-1',
        absolute: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 - scrollBarWidth + leftScrollW } },
        relative: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 - scrollBarWidth } }, // JQuery returns +22/22
        viewport: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'static-2',
        absolute: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } },
        relative: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns +121/6
        viewport: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } }
      }
    ];

    runChecks(doc, tests);
  };

  const tableChecks = function (doc) {
    const extraHeight = 460; // because all tests are in one page
    const leftScrollW = leftScrollBarWidth(doc);

    // JQUERY BUG:
    // jQuery doesn't accept position:static elements as the offsetParent in relative calculations, so it uses the whole document.
    // We aren't replicating that.

    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    const tests = [
      {
        id: 'table-1',
        absolute: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 - scrollBarWidth + leftScrollW } },
        relative: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 - scrollBarWidth } },
        viewport: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'th-1',
        absolute: { top: extraHeight + 10, left: { ltr: 9, rtl: 387 - scrollBarWidth + leftScrollW } },
        relative: { top: 4, left: { ltr: 4, rtl: 216 } },  // JQuery returns extraHeight + 11/10, but that's nonsense
        viewport: { top: extraHeight + 10, left: { ltr: 9, rtl: 387 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'th-3',
        absolute: { top: extraHeight + 10, left: { ltr: 221, rtl: 175 - scrollBarWidth + leftScrollW } },
        relative: { top: 4, left: { ltr: 216, rtl: 4 } },  // JQuery returns extraHeight + 11/222, but that's nonsense
        viewport: { top: extraHeight + 10, left: { ltr: 221, rtl: 175 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'td-1',
        absolute: { top: extraHeight + 116, left: { ltr: 9, rtl: 387 - scrollBarWidth + leftScrollW } },
        relative: { top: 110, left: { ltr: 4, rtl: 216 } },  // JQuery returns extraHeight + 117/10, but that's nonsense
        viewport: { top: extraHeight + 116, left: { ltr: 9, rtl: 387 - scrollBarWidth + leftScrollW } }
      },
      {
        id: 'td-3',
        absolute: { top: extraHeight + 116, left: { ltr: 221, rtl: 175 - scrollBarWidth + leftScrollW } },
        relative: { top: 110, left: { ltr: 216, rtl: 4 } },  // JQuery returns extraHeight + 117/222, but that's nonsense
        viewport: { top: extraHeight + 116, left: { ltr: 221, rtl: 175 - scrollBarWidth + leftScrollW } }
      }
    ];

    // Chrome has a weird 2px bug where the offsetTop of a table cell is 2px less than every other browser, even though
    // the difference between table.getBoundingClientRect() and cell.getBoundingClientRect() is correct.
    // I don't want to make every browser pay for Chrome's mistake in a scenario we don't need for TBIO, so we're living with it.
    if (platform.browser.isChrome()) {
      const chromeDifference = -2;
      Arr.each(tests, function (t) {
        if (t.id !== 'table-1') {
          // tslint:disable-next-line:no-console
          console.log('> Note - fix for Chrome bug - subtracting from relative top and left: ', chromeDifference);
          t.relative.top += chromeDifference;
          t.relative.left.ltr += chromeDifference;
          t.relative.left.rtl += chromeDifference;
        }
      });
    }

    runChecks(doc, tests);
  };

  const fixedChecks = function (doc) {
    const leftScrollW = leftScrollBarWidth(doc);

    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    const noScroll = [
      {
        id: 'fixed-1',
        absolute: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } },
        relative: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } }, // JQuery returns 0/0
        viewport: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } }
      },
      {
        id: 'fixed-2',
        absolute: { top: 21, left: { ltr: 21, rtl: 21 + leftScrollW } },
        relative: { top: 21, left: { ltr: 21, rtl: 21 + leftScrollW } }, // JQuery returns 20/20
        viewport: { top: 21, left: { ltr: 21, rtl: 21 + leftScrollW } }
      },
      {
        id: 'fixed-no-top-left',
        absolute: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } },
        relative: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } }, // JQuery returns 6/6
        viewport: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } }
      }
    ];

    // relative scroll
    const leftScroll = (doc.rtl && (platform.browser.isIE() || platform.browser.isEdge())) ? -1000 : 1000; // IE has RTL -ve direction from left to right
    const topScroll = 2000;
    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    const withScroll = [
      {
        id: 'fixed-1',
        absolute: { top: topScroll + 1, left: { ltr: leftScroll + 1, rtl: 1 + leftScrollW } },
        relative: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } }, // JQuery returns 0/0
        viewport: { top: 1, left: { ltr: 1, rtl: 1 + leftScrollW } }
      },
      {
        id: 'fixed-2',
        absolute: { top: topScroll + 21, left: { ltr: leftScroll + 21, rtl: 21 + leftScrollW } },
        relative: { top: 21, left: { ltr: 21, rtl: 21 + leftScrollW } }, // JQuery returns 20/20
        viewport: { top: 21, left: { ltr: 21, rtl: 21 + leftScrollW } }
      },
      {
        id: 'fixed-no-top-left',
        absolute: { top: topScroll + 6, left: { ltr: leftScroll + 6, rtl: 380 - scrollBarWidth + leftScrollW } },
        relative: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } }, // JQuery returns 6/6
        viewport: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth + leftScrollW } }
      }
    ];

    const afterSetPosition = [
      {
        id: 'fixed-no-top-left',
        absolute: { top: topScroll + 11, left: { ltr: leftScroll + 21, rtl: 21 + leftScrollW } },
        relative: { top: 11, left: { ltr: 21, rtl: 21 + leftScrollW } }, // JQuery returns 10/20
        viewport: { top: 11, left: { ltr: 21, rtl: 21 + leftScrollW } }
      }
    ];

    runChecks(doc, noScroll);

    const scr = Scroll.get(doc.rawDoc);
    assert.eq(0, scr.left(), 'expected 0, left is=' + scr.left());
    assert.eq(0, scr.top(), 'expected 0, top is ' + scr.top());

    Scroll.by(leftScroll, topScroll, doc.rawDoc);
    runChecks(doc, withScroll);

    Css.setAll(doc.byId('fixed-no-top-left'), { top: '10px', left: '20px' });
    runChecks(doc, afterSetPosition);
  };

  const bodyChecks = function (doc) {
    Scroll.to(1000, 1000, doc.rawDoc);
    let pos = Location.absolute(doc.body);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.relative(doc.body);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.viewport(doc.body);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
  };

  /* Simple verification logic */
  const runChecks = function (doc, tests) {
    Arr.each(tests, function (t) {
      const div = doc.byId(t.id);

      let pos = Location.absolute(div);
      asserteq(t.absolute.top, pos.top(), '.absolute().top  ' + t.id);
      asserteq(t.absolute.left[doc.dir], pos.left(), '.absolute().left.' + doc.dir + ' ' + t.id);
      pos = Location.relative(div);
      asserteq(t.relative.top, pos.top(), '.relative().top  ' + t.id);
      asserteq(t.relative.left[doc.dir], pos.left(), '.relative().left.' + doc.dir + ' ' + t.id);
      pos = Location.viewport(div);
      asserteq(t.viewport.top, pos.top(), '.viewport().top  ' + t.id);
      asserteq(t.viewport.left[doc.dir], pos.left(), '.viewport().left.' + doc.dir + ' ' + t.id);
    });
  };
});
