import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import DomEvent from 'ephox/sugar/api/events/DomEvent';
import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Attr from 'ephox/sugar/api/properties/Attr';
import Css from 'ephox/sugar/api/properties/Css';
import Location from 'ephox/sugar/api/view/Location';
import Scroll from 'ephox/sugar/api/view/Scroll';
import { UnitTest, assert } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';

UnitTest.asynctest('LocationTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var browser = PlatformDetection.detect().browser;
  var scrollBarWidth = Scroll.scrollBarWidth();

  var asserteq = function (expected, actual, message) {
    // I wish assert.eq printed expected and actual on failure
    var m = message === undefined ? undefined : 'expected ' + expected + ', was ' + actual + ': ' + message;
    assert.eq(expected, actual, m);
  };

  var testOne = function (ifr, attrMap, next) {
    var iframe = Element.fromHtml(ifr);
    Attr.setAll(iframe, attrMap.iframe);

    var run = DomEvent.bind(iframe, 'load', function () {
      run.unbind();
      try {
        var iframeWin = iframe.dom().contentWindow;
        var iframeDoc = iframeWin.document;
        var html = Element.fromDom(iframeDoc.documentElement);
        var body = Element.fromDom(iframeDoc.body);
        attrMap.html.each(Fun.curry(Attr.setAll, html));
        attrMap.body.each(Fun.curry(Attr.setAll, body));
        var doc = {
          iframe: iframe,
          rawWin: iframeWin,
          rawDoc: Element.fromDom(iframeDoc),
          body: body,
          rtl: iframeDoc.body.dir === 'rtl',
          dir: Attr.get(body, 'dir') || 'ltr',
          byId: function (str) {
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

  var ifr = '<iframe src="project/src/test/data/locationTest.html"></iframe>';

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

  var checks = function (doc) {

    Arr.each([
      baseChecks,
      disconnectedChecks,
      absoluteChecks,
      relativeChecks,
      staticChecks,
      tableChecks,
      fixedChecks // recommend making these last, as they adjust the iframe scroll
    ], function (f) {
      f(doc);
    });
  };

  var baseChecks = function () {
    // these checks actually depend on the tunic stylesheet. They might not actually be useful.
    var body = Body.body();
    var pos = Location.absolute(body);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.relative(body);
    assert.eq(0, pos.top()); // JQuery doesn't return 0, but this makes more sense
    assert.eq(0, pos.left());
    pos = Location.viewport(body);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    assert.eq(true, scrollBarWidth > 5 && scrollBarWidth < 50, 'scroll bar width, got=' + scrollBarWidth);

  };

  var disconnectedChecks = function () {
    var div = Element.fromTag('div');
    var pos = Location.absolute(div);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.relative(div);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
    pos = Location.viewport(div);
    assert.eq(0, pos.top());
    assert.eq(0, pos.left());
  };

  var absoluteChecks = function (doc) {
    // This one has position absolute, but no values set initially
    Css.setAll(doc.byId('positionTest'), { top: '10px', left: '10px' });
    // GUESS: 1px differences from JQuery is due to the 1px margin on the body

    var tests = [
      {
        id: 'absolute-1',
        absolute: { top: 1, left: { ltr: 1, rtl: 1 } },
        relative: { top: 1, left: { ltr: 1, rtl: 1 } }, // JQuery returns 0/0
        viewport: { top: 1, left: { ltr: 1, rtl: 1 } }
      },
      {
        id: 'absolute-1-1',
        absolute: { top: 5, left: { ltr: 5, rtl: 5 } },
        relative: { top: 2, left: { ltr: 2, rtl: 2 } }, // JQuery returns 1/1
        viewport: { top: 5, left: { ltr: 5, rtl: 5 } }
      },
      {
        id: 'absolute-1-1-1',
        absolute: { top: 9, left: { ltr: 9, rtl: 9 } },
        relative: { top: 2, left: { ltr: 2, rtl: 2 } }, // JQuery returns 1/1
        viewport: { top: 9, left: { ltr: 9, rtl: 9 } }
      },
      {
        id: 'absolute-2',
        absolute: { top: 20, left: { ltr: 20, rtl: 20 } },
        relative: { top: 20, left: { ltr: 20, rtl: 20 } }, // JQuery returns 19/19
        viewport: { top: 20, left: { ltr: 20, rtl: 20 } }
      },
      {
        id: 'positionTest',
        absolute: { top: 10, left: { ltr: 10, rtl: 10 } },
        relative: { top: 10, left: { ltr: 10, rtl: 10 } },
        viewport: { top: 10, left: { ltr: 10, rtl: 10 } }
      }
    ];

    runChecks(doc, tests);
  };

  var relativeChecks = function (doc) {
    // GUESS: 1px differences from JQuery is due to the 1px margin on the body

    var tests = [
      {
        id: 'relative-1',
        absolute: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } },
        relative: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns 6/6
        viewport: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }
      },
      {
        id: 'relative-1-1',
        absolute: { top: 14, left: { ltr: 14, rtl: 372 - scrollBarWidth } },
        relative: { top: 6, left: { ltr: 6, rtl: -10 } }, // JQuery returns 5/5
        viewport: { top: 14, left: { ltr: 14, rtl: 372 - scrollBarWidth } }
      },
      {
        id: 'relative-1-1-1',
        absolute: { top: 22, left: { ltr: 22, rtl: 364 - scrollBarWidth } },
        relative: { top: 6, left: { ltr: 6, rtl: -10 } }, // JQuery returns 5/5
        viewport: { top: 22, left: { ltr: 22, rtl: 364 - scrollBarWidth } }
      },
      {
        id: 'relative-2',
        absolute: { top: 141, left: { ltr: 26, rtl: 400 - scrollBarWidth } },
        relative: { top: 141, left: { ltr: 26, rtl: 400 - scrollBarWidth } }, // JQuery returns 141/26
        viewport: { top: 141, left: { ltr: 26, rtl: 400 - scrollBarWidth } }
      },

      // This simulates a docked ego state for the toolbars
      {
        id: 'relative-toolbar-container',
        absolute: { top: 684, left: { ltr: 5, rtl: 395 - scrollBarWidth } },
        relative: { top: 684, left: { ltr: 5, rtl: 395 - scrollBarWidth } },
        viewport: { top: 684, left: { ltr: 5, rtl: 395 - scrollBarWidth } }
      },
      {
        id: 'relative-toolbar',
        absolute: { top: 684 - 40, left: { ltr: 5, rtl: 395 - scrollBarWidth } },
        relative: { top: -40, left: { ltr: 0, rtl: 0 } },
        viewport: { top: 684 - 40, left: { ltr: 5, rtl: 395 - scrollBarWidth } }
      }
    ];

    runChecks(doc, tests);
  };

  var staticChecks = function (doc) {
    var extraHeight = 230; // because all tests are in one page
    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    var tests = [
      {
        id: 'static-1',
        absolute: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } },
        relative: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns +6/6
        viewport: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }
      },
      {
        id: 'static-1-1',
        absolute: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 - scrollBarWidth } },
        relative: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 - scrollBarWidth } }, // JQuery returns +14/14
        viewport: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 - scrollBarWidth } }
      },
      {
        id: 'static-1-1-1',
        absolute: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 - scrollBarWidth } },
        relative: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 - scrollBarWidth } }, // JQuery returns +22/22
        viewport: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 - scrollBarWidth } }
      },
      {
        id: 'static-2',
        absolute: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 - scrollBarWidth } },
        relative: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns +121/6
        viewport: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 - scrollBarWidth } }
      }
    ];

    runChecks(doc, tests);
  };

  var tableChecks = function (doc) {
    var extraHeight = 460; // because all tests are in one page

    // JQUERY BUG:
    // jQuery doesn't accept position:static elements as the offsetParent in relative calculations, so it uses the whole document.
    // We aren't replicating that.

    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    var tests = [
      {
        id: 'table-1',
        absolute: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 - scrollBarWidth } },
        relative: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 - scrollBarWidth } },
        viewport: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 - scrollBarWidth } }
      },
      {
        id: 'th-1',
        absolute: { top: extraHeight + 10, left: { ltr: 9, rtl: 387 - scrollBarWidth } },
        relative: { top: 4, left: { ltr: 4, rtl: 216 } },  // JQuery returns extraHeight + 11/10, but that's nonsense
        viewport: { top: extraHeight + 10, left: { ltr: 9, rtl: 387 - scrollBarWidth } }
      },
      {
        id: 'th-3',
        absolute: { top: extraHeight + 10, left: { ltr: 221, rtl: 175 - scrollBarWidth } },
        relative: { top: 4, left: { ltr: 216, rtl: 4 } },  // JQuery returns extraHeight + 11/222, but that's nonsense
        viewport: { top: extraHeight + 10, left: { ltr: 221, rtl: 175 - scrollBarWidth } }
      },
      {
        id: 'td-1',
        absolute: { top: extraHeight + 116, left: { ltr: 9, rtl: 387 - scrollBarWidth } },
        relative: { top: 110, left: { ltr: 4, rtl: 216 } },  // JQuery returns extraHeight + 117/10, but that's nonsense
        viewport: { top: extraHeight + 116, left: { ltr: 9, rtl: 387 - scrollBarWidth } }
      },
      {
        id: 'td-3',
        absolute: { top: extraHeight + 116, left: { ltr: 221, rtl: 175 - scrollBarWidth } },
        relative: { top: 110, left: { ltr: 216, rtl: 4 } },  // JQuery returns extraHeight + 117/222, but that's nonsense
        viewport: { top: extraHeight + 116, left: { ltr: 221, rtl: 175 - scrollBarWidth } }
      }
    ];

    // Chrome has a weird 2px bug where the offsetTop of a table cell is 2px less than every other browser, even though
    // the difference between table.getBoundingClientRect() and cell.getBoundingClientRect() is correct.
    // I don't want to make every browser pay for Chrome's mistake in a scenario we don't need for TBIO, so we're living with it.
    if (PlatformDetection.detect().browser.isChrome()) {
      var chromeDifference = -2;
      Arr.each(tests, function (t) {
        if (t.id !== 'table-1') {
          console.log('> Note - fix for Chrome bug - subtracting from relative top and left: ', chromeDifference);
          t.relative.top += chromeDifference;
          t.relative.left.ltr += chromeDifference;
          t.relative.left.rtl += chromeDifference;
        }
      });
    }

    runChecks(doc, tests);
  };

  var fixedChecks = function (doc) {

    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    var noScroll = [
      {
        id: 'fixed-1',
        absolute: { top: 1, left: { ltr: 1, rtl: 1 } },
        relative: { top: 1, left: { ltr: 1, rtl: 1 } }, // JQuery returns 0/0
        viewport: { top: 1, left: { ltr: 1, rtl: 1 } }
      },
      {
        id: 'fixed-2',
        absolute: { top: 21, left: { ltr: 21, rtl: 21 } },
        relative: { top: 21, left: { ltr: 21, rtl: 21 } }, // JQuery returns 20/20
        viewport: { top: 21, left: { ltr: 21, rtl: 21 } }
      },
      {
        id: 'fixed-no-top-left',
        absolute: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } },
        relative: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns 6/6
        viewport: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }
      }
    ];

    // relative scroll
    var leftScroll = (doc.rtl && (browser.isIE() || browser.isEdge())) ? -1000 : 1000; // IE has RTL -ve direction from left to right
    var topScroll = 2000;
    // GUESS: 1px differences from JQuery is due to the 1px margin on the body
    var withScroll = [
      {
        id: 'fixed-1',
        absolute: { top: topScroll + 1, left: { ltr: leftScroll + 1, rtl: 1 } },
        relative: { top: 1, left: { ltr: 1, rtl: 1 } }, // JQuery returns 0/0
        viewport: { top: 1, left: { ltr: 1, rtl: 1 } }
      },
      {
        id: 'fixed-2',
        absolute: { top: topScroll + 21, left: { ltr: leftScroll + 21, rtl: 21 } },
        relative: { top: 21, left: { ltr: 21, rtl: 21 } }, // JQuery returns 20/20
        viewport: { top: 21, left: { ltr: 21, rtl: 21 } }
      },
      {
        id: 'fixed-no-top-left',
        absolute: { top: topScroll + 6, left: { ltr: leftScroll + 6, rtl: 380 - scrollBarWidth } },
        relative: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }, // JQuery returns 6/6
        viewport: { top: 6, left: { ltr: 6, rtl: 380 - scrollBarWidth } }
      }
    ];

    var afterSetPosition = [
      {
        id: 'fixed-no-top-left',
        absolute: { top: topScroll + 11, left: { ltr: leftScroll + 21, rtl: 21 } },
        relative: { top: 11, left: { ltr: 21, rtl: 21 } }, // JQuery returns 10/20
        viewport: { top: 11, left: { ltr: 21, rtl: 21 } }
      }
    ];

    runChecks(doc, noScroll);

    var scr = Scroll.get(doc.rawDoc);
    assert.eq(0, scr.left(), 'expected 0, left is=' + scr.left());
    assert.eq(0, scr.top(), 'expected 0, top is ' + scr.top());

    Scroll.by(leftScroll, topScroll, doc.rawDoc);
    runChecks(doc, withScroll);

    Css.setAll(doc.byId('fixed-no-top-left'), { top: '10px', left: '20px' });
    runChecks(doc, afterSetPosition);
  };

  /* Simple verification logic */
  var runChecks = function (doc, tests) {
    Arr.each(tests, function (t) {
      var div = doc.byId(t.id);

      var pos = Location.absolute(div);
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

