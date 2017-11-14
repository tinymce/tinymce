asynctest(
  'ScrollTest',

  [
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
    'ephox.sugar.api.view.Scroll',
    'global!Math'
  ],

  function (Fun, Option, PlatformDetection, Insert, Remove, DomEvent, Body, Element, Attr, Css, Location, Scroll, Math) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var browser = PlatformDetection.detect().browser;
    var checkBodyScroller = browser.isFirefox() || browser.isChrome(); // TBIO-5098

    var asserteq = function (expected, actual, message) {
      // I wish assert.eq printed expected and actual on failure
      var m = message === undefined ? undefined : 'expected ' + expected + ', was ' + actual + ': ' + message;
      assert.eq(expected, actual, m);
    };

    var scrollBarWidth = function () {
      // From https://davidwalsh.name/detect-scrollbar-width
      var scrollDiv = Element.fromHtml('<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;"></div>');
      Insert.after(Body.body(), scrollDiv);
      var w = scrollDiv.dom().offsetWidth - scrollDiv.dom().clientWidth;
      Remove.remove(scrollDiv);
      return w;
    };

    var rtlMaxLeftIsZero = function () {
      var scrollDiv = Element.fromHtml('<div dir=rtl style="width: 10px; height: 10px; overflow: scroll; position: absolute; top: -9999px;">XXX</div>');
      Insert.after(Body.body(), scrollDiv);
      var l = scrollDiv.dom().scrollLeft;
      Remove.remove(scrollDiv);
      return l === 0;
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
          runTests(doc);
          Remove.remove(iframe);
          next();
        } catch (e) {
          // Remove.remove(iframe);
          failure(e);
        }
      });
    };

    var ifr = '<iframe src="project/src/test/data/scrollTest.html"></iframe>';

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
        : success
    );

    var scrollCheck = function (x, y, doc, msg) {
      var scr = Scroll.get(doc.rawDoc);
      assert.eq(x, scr.left(), msg + ' (' + doc.dir + ') Expected scrollCheck x=' + x + ', got=' + scr.left());
      assert.eq(y, scr.top(), msg + ' (' + doc.dir + ') Expected scrollCheck y=' + y + ', got=' + scr.top());
    };

    var scrollTo = function (x, y, doc) {
      Scroll.set(x, y, doc.rawDoc);
      scrollCheck(x, y, doc, 'scrollTo(' + x + ',' + y + ')');
    };

    var scrollBy = function (x, y, doc, msg) {
      var scr0 = Scroll.get(doc.rawDoc);
      Scroll.by(x, y, doc.rawDoc);
      var scr = Scroll.get(doc.rawDoc);
      // browsers will scroll the X differently depending on dir
      assert.eq(true, Math.abs(scr.left() - scr0.left()) === Math.abs(x), 'scrollBy(' + x + ',' + y + ')' + ' (' + doc.dir + ') Expected diff x=' + x + ', got=' + Math.abs(scr.left() - scr0.left()));
      assert.eq(y + scr0.top(), scr.top(), 'scrollBy(' + x + ',' + y + ')' + ' (' + doc.dir + ') Expected y+top=' + y + scr0.top() + ', got=' + scr.top());
    };

    var runTests = function (doc) {
      var mar0 = Css.getRaw(doc.body, 'margin').getOrDie();  // tests should specify this prop
      var pad0 = Css.getRaw(doc.body, 'padding').getOrDie(); // tests should specify this prop
      var mar = parseInt(mar0, 10);
      var pad = parseInt(pad0, 10);
      var hgt = doc.body.dom().scrollHeight;
      var scrollW = scrollBarWidth();
      var cEl = doc.byId('centre1');
      var cA = Location.absolute(cEl);
      // centre element (x,y)
      var x = Math.round(cA.left());
      var y = Math.round(cA.top());
      // FF: rtlMaxLeftIsZero() === true (per the spec)
      // FF, rightmost:  0           body.scrollLeft, body.scrollWidth , body.clientWidth  (0 5015 485)
      // FF, leftmost:   -4527..0:   body.scrollLeft = body.clientWidth - body.scrollWidth (-4527 = 488 - 5015)
      // Chrome: rtlMaxLeftIsZero() === false
      // Chrome, leftmost:  0        body.scrollLeft, body.scrollWidth , body.clientWidth  (0 5015 485)
      // Chrome, rightmost: 0..4530: body.scrollLeft = body.scrollWidth - body.clientWidth (4530 = 5015 - 485)
      var bodySW = doc.body.dom().scrollWidth;
      var bodyCW = doc.body.dom().clientWidth;
      var left = doc.rtl && !rtlMaxLeftIsZero() ? bodySW /* 5010 + pad */ - bodyCW /* (doc.rawWin.innerWidth - scrollW) */ : 0; // most-left x val
      var scrollL = doc.rtl ?
        (rtlMaxLeftIsZero() ?
          -(bodySW /* (5010 + pad) */ - bodyCW /* (doc.rawWin.innerWidth - scrollW) */)
          : 0)
        : (mar + pad);
      console.log('> testing iframe id=', doc.iframe.dom().id, ', rtl?=', doc.rtl);

      scrollCheck(left, 0, doc, 'start pos');

      // scroll centre cell into view
      scrollTo(x, y, doc);

      scrollBy(-50, 30, doc);
      scrollBy(50, -30, doc);
      scrollCheck(x, y, doc, 'reset');

      Scroll.setToElement(doc.rawWin, doc.byId('top1'));
      scrollCheck(scrollL, mar + pad, doc, 'setToElement top');

      scrollTo(x, y, doc);

      Scroll.setToElement(doc.rawWin, doc.byId('bot1'));
      var bot = hgt + 2 * mar - (doc.rawWin.innerHeight - scrollW); // content height minus viewport-excluding-the-bottom-scrollbar
      scrollCheck(scrollL, bot, doc, 'setToElement bottom');

      // Back to center
      scrollTo(x, y, doc);
      Scroll.preserve(doc.rawDoc, function () {
        scrollTo((doc.rtl && rtlMaxLeftIsZero() ? -30 : 30), 40, doc);
      });
      scrollCheck(x, y, doc, 'preserve');

      // Back to center
      scrollTo(x, y, doc);
      var c1 = Scroll.capture(doc.rawDoc);
      scrollTo((doc.rtl && rtlMaxLeftIsZero() ? -3000 : 3000), 4000, doc);
      c1.restore();
      scrollCheck(x, y, doc, 'restore #1');
      scrollTo((doc.rtl && rtlMaxLeftIsZero() ? -500 : 500), 400, doc);
      c1.save();
      scrollTo((doc.rtl && rtlMaxLeftIsZero() ? -900 : 900), 900, doc);
      c1.restore();
      scrollCheck((doc.rtl && rtlMaxLeftIsZero() ? -500 : 500), 400, doc, 'restore #2');
    };
  }
);