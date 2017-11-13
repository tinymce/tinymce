asynctest(
  'LocationTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Scroll'
  ],

  function (Fun, Option, Insert, Remove, DomEvent, Body, Element, Attr, Css, Scroll) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

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
      body: Option.none()
    },
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
      });

    var scrollCheck = function (x, y, doc, msg) {
      var scr = Scroll.get(doc.rawDoc);
      assert.eq(x, scr.left(), msg + ' (' + doc.dir + ') Expected scrollCheck x=' + x + ', got=' + scr.left());
      assert.eq(y, scr.top(),  msg + ' (' + doc.dir + ') Expected scrollCheck y=' + y + ', got=' + scr.top());
    };

    var scrollTo = function (x, y, doc) {
      Scroll.set(x, y, doc.rawDoc);
      scrollCheck(x, y, doc, 'scrollTo(' + x + ',' + y + ')');
    };

    var scrollBy = function (x, y, doc) {
      var scr = Scroll.get(doc.rawDoc);
      Scroll.by(x, y, doc.rawDoc);
      scrollCheck(scr.left() + x, scr.top() + y, doc, 'scrollBy(' + x + ',' + y + ')');
    };

    var runTests = function (doc) {
      var mar = parseInt(Css.get(doc.body, 'margin'), 10);
      var pad = parseInt(Css.get(doc.body, 'padding'), 10);
      var hgt = doc.body.dom().scrollHeight;
      var x = 2500;
      var y = 2600;
      var left = doc.rtl ? 5010 + pad - (doc.rawWin.innerWidth - 15) : 0; // content width plus viewport-excluding-the-right-scrollbar
      console.log('> testing iframe id=', doc.iframe.dom().id, ', rtl?=', doc.rtl);

      scrollCheck(left, 0, doc, 'start pos');

      scrollTo(x, y, doc);

      scrollBy(-1000, 1000, doc);
      scrollBy(1000, -1000, doc);
      scrollCheck(x, y, doc, 'reset');

      Scroll.setToElement(doc.rawWin, doc.byId('top1'));
      var topL = doc.rtl ? 0 : (mar + pad);
      scrollCheck(topL, mar + pad, doc, 'setToElement top');

      scrollTo(x, y, doc);

      Scroll.setToElement(doc.rawWin, doc.byId('bot1'));
      var bot = hgt + 2 * mar - (doc.rawWin.innerHeight - 15); // content height minus viewport-excluding-the-bottom-scrollbar
      var botL = doc.rtl ? 0 : (mar + pad);
      scrollCheck(botL, bot, doc, 'setToElement bottom');

      // Back to center
      scrollTo(x, y, doc);
      Scroll.preserve(doc.rawDoc, function () {
        scrollTo(30, 40, doc);
      });
      scrollCheck(x, y, doc, 'preserve');

      // Back to center
      scrollTo(x, y, doc);
      var c1 = Scroll.capture(doc.rawDoc);
      scrollTo(3000, 4000, doc);
      c1.restore();
      scrollCheck(x, y, doc, 'restore #1');
      scrollTo(500, 400, doc);
      c1.save();
      scrollTo(900, 900, doc);
      c1.restore();
      scrollCheck(500, 400, doc, 'restore #2');
    };
  }
);