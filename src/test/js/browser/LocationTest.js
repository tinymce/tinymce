asynctest(
  'LocationTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Scroll'
  ],

  function (Arr, Fun, Option, PlatformDetection, Insert, Remove, DomEvent, Body, Element, Attr, Css, Location, Scroll) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var browser = PlatformDetection.detect().browser;
    var checkBodyScroller = browser.isFirefox() || browser.isChrome(); // TBIO-5098

    var rtlMaxLeftIsZero = function () {
      var scrollDiv = Element.fromHtml('<div dir=rtl style="width: 10px; height: 10px; overflow: scroll; position: absolute; top: -9999px;">XXX</div>');
      Insert.after(Body.body(), scrollDiv);
      var l = scrollDiv.dom().scrollLeft;
      Remove.remove(scrollDiv);
      return l === 0;
    };

    var asserteq = function (expected, actual, message) {
      // I wish assert.eq printed expected and actual on failure
      var m = message === undefined ? undefined : 'expected ' + expected + ', was ' + actual + ': ' + message;
      assert.eq(expected, actual, m);
    };

    var testOne = function (ifr, attrMap, next) {
      var iframe = Element.fromHtml(ifr);
      Attr.setAll(iframe, attrMap.iframe);
      Insert.append(Body.body(), iframe);

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
          Remove.remove(iframe);
          failure(e);
        }
      });
    };

    var ifr = '<iframe src="project/src/test/data/locationTest.html"></iframe>';

    testOne(ifr, { // vanilla iframe
      iframe: { id: 'vanilla', style: 'height:200px; width:500px; border: 1px dashed chartreuse;' },
      html: Option.none(),
      body: Option.some({ style: 'margin: 0; padding: 5px;' })
    },
      checkBodyScroller ?
        function () {
          testOne(ifr, { // body-scroll ltr iframe
            iframe: { id: 'bodyScrollerLtr', style: 'height:200px; width:500px; border: 1px dashed aquamarine;' },
            html: Option.some({ style: 'overflow: hidden;' }),
            body: Option.some({ contenteditable: 'true', dir: 'ltr', style: 'margin: 0; padding: 5px; height: 200px; overflow: auto; box-sizing: border-box;' }) //
          },
            function () {
              testOne(ifr, { // body-scroll rtl iframe
                iframe: { id: 'bodyScrollerRtl', style: 'height:200px; width:500px; border: 1px dashed turquoise;' },
                html: Option.some({ style: 'overflow: hidden;' }),
                body: Option.some({ contenteditable: 'true', dir: 'rtl', style: 'margin: 0; padding: 5px; height: 200px; overflow: auto; box-sizing: border-box;' })
              },
                success);
            });
        }
        : success);


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
      var scrollLeft = doc.body.dom().scrollLeft;
      var clientLeft = doc.body.dom().clientLeft;

      var tests = [
        {
          id: 'absolute-1',
          absolute: { top: 1, left: { ltr: 1, rtl: 1 + scrollLeft - clientLeft /* FF -11, Cr 4506*/ } },
          relative: { top: 1, left: { ltr: 1, rtl: 1 } }, // JQuery returns 0/0
          viewport: { top: 1, left: { ltr: 1, rtl: 1 } }
        },
        {
          id: 'absolute-1-1',
          absolute: { top: 5, left: { ltr: 5, rtl: 5 + scrollLeft - clientLeft /* FF -7, Cr 4510 */ } },
          relative: { top: 2, left: { ltr: 2, rtl: 2 } }, // JQuery returns 1/1
          viewport: { top: 5, left: { ltr: 5, rtl: 5 } }
        },
        {
          id: 'absolute-1-1-1',
          absolute: { top: 9, left: { ltr: 9, rtl: 9 + scrollLeft - clientLeft /* FF -3,  4514 */ } },
          relative: { top: 2, left: { ltr: 2, rtl: 2 } }, // JQuery returns 1/1
          viewport: { top: 9, left: { ltr: 9, rtl: 9 } }
        },
        {
          id: 'absolute-2',
          absolute: { top: 20, left: { ltr: 20, rtl: 20 + scrollLeft - clientLeft } },
          relative: { top: 20, left: { ltr: 20, rtl: 20 } }, // JQuery returns 19/19
          viewport: { top: 20, left: { ltr: 20, rtl: 20 } }
        },
        {
          id: 'positionTest',
          absolute: { top: 10, left: { ltr: 10, rtl: 10 + scrollLeft - clientLeft } },
          relative: { top: 10, left: { ltr: 10, rtl: 10 } },
          viewport: { top: 10, left: { ltr: 10, rtl: 10 } }
        }
      ];

      runChecks(doc, tests);
    };

    var relativeChecks = function (doc) {
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var scrollLeft = doc.body.dom().scrollLeft;
      var clientLeft = doc.body.dom().clientLeft;

      var tests = [
        {
          id: 'relative-1',
          absolute: { top: 6, left: { ltr: 6, rtl: 380 + scrollLeft - clientLeft } },
          relative: { top: 6, left: { ltr: 6, rtl: 380 } }, // JQuery returns 6/6
          viewport: { top: 6, left: { ltr: 6, rtl: 380 } }
        },
        {
          id: 'relative-1-1',
          absolute: { top: 14, left: { ltr: 14, rtl: 372 + scrollLeft - clientLeft } },
          relative: { top: 6, left: { ltr: 6, rtl: -10 } }, // JQuery returns 5/5
          viewport: { top: 14, left: { ltr: 14, rtl: 372 } }
        },
        {
          id: 'relative-1-1-1',
          absolute: { top: 22, left: { ltr: 22, rtl: 364 + scrollLeft - clientLeft } },
          relative: { top: 6, left: { ltr: 6, rtl: -10 } }, // JQuery returns 5/5
          viewport: { top: 22, left: { ltr: 22, rtl: 364 } }
        },
        {
          id: 'relative-2',
          absolute: { top: 141, left: { ltr: 26, rtl: 400 + scrollLeft - clientLeft } },
          relative: { top: 141, left: { ltr: 26, rtl: 400 } }, // JQuery returns 141/26
          viewport: { top: 141, left: { ltr: 26, rtl: 400 } }
        },

        // This simulates a docked ego state for the toolbars
        {
          id: 'relative-toolbar-container',
          absolute: { top: 684, left: { ltr: 5, rtl: 395 + scrollLeft - clientLeft } },
          relative: { top: 684, left: { ltr: 5, rtl: 395 } },
          viewport: { top: 684, left: { ltr: 5, rtl: 395 } }
        },
        {
          id: 'relative-toolbar',
          absolute: { top: 684 - 40, left: { ltr: 5, rtl: 395 + scrollLeft - clientLeft } },
          relative: { top: -40, left: { ltr: 0, rtl: 0 } },
          viewport: { top: 684 - 40, left: { ltr: 5, rtl: 395 } }
        }
      ];

      runChecks(doc, tests);
    };

    var staticChecks = function (doc) {
      var scrollLeft = doc.body.dom().scrollLeft;
      var clientLeft = doc.body.dom().clientLeft;
      var extraHeight = 230; // because all tests are in one page
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var tests = [
        {
          id: 'static-1',
          absolute: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 + scrollLeft - clientLeft } },
          relative: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 } }, // JQuery returns +6/6
          viewport: { top: extraHeight + 6, left: { ltr: 6, rtl: 380 } }
        },
        {
          id: 'static-1-1',
          absolute: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 + scrollLeft - clientLeft } },
          relative: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 } }, // JQuery returns +14/14
          viewport: { top: extraHeight + 14, left: { ltr: 14, rtl: 372 } }
        },
        {
          id: 'static-1-1-1',
          absolute: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 + scrollLeft - clientLeft } },
          relative: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 } }, // JQuery returns +22/22
          viewport: { top: extraHeight + 22, left: { ltr: 22, rtl: 364 } }
        },
        {
          id: 'static-2',
          absolute: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 + scrollLeft - clientLeft } },
          relative: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 } }, // JQuery returns +121/6
          viewport: { top: extraHeight + 121, left: { ltr: 6, rtl: 380 } }
        }
      ];

      runChecks(doc, tests);
    };

    var tableChecks = function (doc) {
      var scrollLeft = doc.body.dom().scrollLeft;
      var clientLeft = doc.body.dom().clientLeft;
      var extraHeight = 460; // because all tests are in one page

      // JQUERY BUG:
      // jQuery doesn't accept position:static elements as the offsetParent in relative calculations, so it uses the whole document.
      // We aren't replicating that.

      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var tests = [
        {
          id: 'table-1',
          absolute: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 + scrollLeft - clientLeft } },
          relative: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 } },
          viewport: { top: extraHeight + 6, left: { ltr: 5, rtl: 171 } }
        },
        {
          id: 'th-1',
          absolute: { top: extraHeight + 10, left: { ltr: 9, rtl: 387 + scrollLeft - clientLeft } },
          relative: { top: 4, left: { ltr: 4, rtl: 216 } },  // JQuery returns extraHeight + 11/10, but that's nonsense
          viewport: { top: extraHeight + 10, left: { ltr: 9, rtl: 387 } }
        },
        {
          id: 'th-3',
          absolute: { top: extraHeight + 10, left: { ltr: 221, rtl: 175 + scrollLeft - clientLeft } },
          relative: { top: 4, left: { ltr: 216, rtl: 4 } },  // JQuery returns extraHeight + 11/222, but that's nonsense
          viewport: { top: extraHeight + 10, left: { ltr: 221, rtl: 175 } }
        },
        {
          id: 'td-1',
          absolute: { top: extraHeight + 116, left: { ltr: 9, rtl: 387 + scrollLeft - clientLeft } },
          relative: { top: 110, left: { ltr: 4, rtl: 216 } },  // JQuery returns extraHeight + 117/10, but that's nonsense
          viewport: { top: extraHeight + 116, left: { ltr: 9, rtl: 387 } }
        },
        {
          id: 'td-3',
          absolute: { top: extraHeight + 116, left: { ltr: 221, rtl: 175 + scrollLeft - clientLeft } },
          relative: { top: 110, left: { ltr: 216, rtl: 4 } },  // JQuery returns extraHeight + 117/222, but that's nonsense
          viewport: { top: extraHeight + 116, left: { ltr: 221, rtl: 175 } }
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
      var scrollWidth = doc.body.dom().scrollWidth;
      var scrollLeft = doc.body.dom().scrollLeft;
      var clientLeft = doc.body.dom().clientLeft;
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var noScroll = [
        {
          id: 'fixed-1',
          absolute: { top: 1, left: { ltr: 1, rtl: 1 + scrollLeft - clientLeft } },
          relative: { top: 1, left: { ltr: 1, rtl: 1 } }, // JQuery returns 0/0
          viewport: { top: 1, left: { ltr: 1, rtl: 1 } }
        },
        {
          id: 'fixed-2',
          absolute: { top: 21, left: { ltr: 21, rtl: 21 + scrollLeft - clientLeft } },
          relative: { top: 21, left: { ltr: 21, rtl: 21 } }, // JQuery returns 20/20
          viewport: { top: 21, left: { ltr: 21, rtl: 21 } }
        },
        {
          id: 'fixed-no-top-left',
          absolute: { top: 6, left: { ltr: 6, rtl: 380 - (browser.isChrome() ? clientLeft : 0) + scrollLeft - clientLeft } }, // RTL chrome puts this in a different spot to firefox
          relative: { top: 6, left: { ltr: 6, rtl: 380 - (browser.isChrome() ? clientLeft : 0) } }, // JQuery returns 6/6
          viewport: { top: 6, left: { ltr: 6, rtl: 380 - (browser.isChrome() ? clientLeft : 0) } }
        }
      ];

      // could instead do a relative scroll
      var leftScroll = doc.rtl && rtlMaxLeftIsZero() ? (-scrollWidth + clientLeft) + 1000 : 1000; // RTL scrollLeft 1000 in Chrome is (-scrollWidth + clientWidth) + 1000 in FF
      var topScroll = 2000;
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var withScroll = [
        {
          id: 'fixed-1',
          absolute: { top: topScroll + 1, left: { ltr: leftScroll + 1, rtl: leftScroll + 1 - clientLeft } },
          relative: { top: 1, left: { ltr: 1, rtl: 1 } }, // JQuery returns 0/0
          viewport: { top: 1, left: { ltr: 1, rtl: 1 } }
        },
        {
          id: 'fixed-2',
          absolute: { top: topScroll + 21, left: { ltr: leftScroll + 21, rtl: leftScroll + 21 - clientLeft } },
          relative: { top: 21, left: { ltr: 21, rtl: 21 } }, // JQuery returns 20/20
          viewport: { top: 21, left: { ltr: 21, rtl: 21 } }
        },
        {
          id: 'fixed-no-top-left',
          absolute: { top: topScroll + 6, left: { ltr: leftScroll + 6, rtl: leftScroll - clientLeft + 380 - (browser.isChrome() ? clientLeft : 0) } },
          relative: { top: 6, left: { ltr: 6, rtl: 380 - (browser.isChrome() ? clientLeft : 0) } }, // JQuery returns 6/6
          viewport: { top: 6, left: { ltr: 6, rtl: 380 - (browser.isChrome() ? clientLeft : 0) } }
        }
      ];

      var afterSetPosition = [
        {
          id: 'fixed-no-top-left',
          absolute: { top: topScroll + 11, left: { ltr: leftScroll + 21, rtl: leftScroll + 21 - clientLeft } },
          relative: { top: 11, left: { ltr: 21, rtl: 21 } }, // JQuery returns 10/20
          viewport: { top: 11, left: { ltr: 21, rtl: 21 } }
        }
      ];

      runChecks(doc, noScroll);

      Scroll.set(leftScroll, topScroll, doc.rawDoc);
      runChecks(doc, withScroll);

      Css.setAll(doc.byId('fixed-no-top-left'), { top: '10px', left: '20px' });
      runChecks(doc, afterSetPosition);
    };

    /* Simple verification logic */
    var runChecks = function (doc, tests) {
      console.log('> testing iframe id=', doc.iframe.dom().id, ', dir=', doc.dir);
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
  }
);
/*

 cr el: DOMRect {x: 1, y: 1, width: 114, height: 114, top: 1, …}
 ff el: DOMRect { x: 1, y: 1, width: 114, height: 114, top: 1, right: 115, bottom: 115, left: 1 }
       FF  Cr
 rtl: -11 4506

 Formula: left+scrollLeft-clientLeft
  CR: 1 + 4520 - 15 = 4506
  FF: 1 + 0 - 12    = -11

  CR body   $0.scrollWidth-$0.scrollLeft-$0.clientWidth = 0
    $0.scrollWidth
    5005
    $0.scrollLeft
    4520
    $0.clientLeft
    15
    $0.clientWidth
    485
    $0.offsetWidth
    500

  FF body
    $0.scrollWidth
    5005
    $0.scrollLeft
    0
    $0.clientLeft
    12
    $0.clientWidth
    488
    $0.offsetWidth
    500
*/