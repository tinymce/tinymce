asynctest(
  'LocationTest',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Scroll'
  ],

  function (Option, Insert, Remove, DomEvent, Body, Element, Css, Scroll) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var asserteq = function (expected, actual, message) {
      // I wish assert.eq printed expected and actual on failure
      var m = message === undefined ? undefined : 'expected ' + expected + ', was ' + actual + ': ' + message;
      assert.eq(expected, actual, m);
    };

    var testOne = function (ifr, next) {
      var iframe = Element.fromHtml(ifr);
      Insert.append(Body.body(), iframe);

      var run = DomEvent.bind(iframe, 'load', function () {
        run.unbind();
        try {
          checks(iframe);
          Remove.remove(iframe);
          next();
        } catch (e) {
          Remove.remove(iframe);
          failure(e);
        }
      });
    };

    testOne('<iframe style="height:200px; width:500px; border: 1px dashed chartreuse;" src="project/src/test/data/scrollTest.html"></iframe>',  // vanilla HTML-scroll iframe
    function () {
      testOne('<iframe style="height:200px; width:500px; border: 1px dashed aquamarine;" src="project/src/test/data/scrollTestBodyScrollerLtrTest.html"></iframe>',  // body-scroll ltr iframe
      //     function () {
      //       testOne('<iframe style="height:200px; width:500px; border: 1px dashed turquoise;" src="project/src/test/data/locationBodyScrollerRtlTest.html"></iframe>',  // body-scroll rtl iframe
      success);
    //     });
    });

    var checks = function (iframe) {
      var iframeWin = iframe.dom().contentWindow;
      var iframeDoc = iframeWin.document;
      var doc = {
        rawWin: iframeWin,
        rawDoc: Element.fromDom(iframeDoc),
        body: Element.fromDom(iframeDoc.body),
        byId: function (str) {
          return Option.from(iframeDoc.getElementById(str))
            .map(Element.fromDom)
            .getOrDie('cannot find element with id ' + str);
        }
      };

      var scrollCheck = function (x, y, doc) {
        var scr = Scroll.get(doc.rawDoc);
        assert.eq(x, scr.left());
        assert.eq(y, scr.top());
      };

      var scrollTo = function (x, y, doc) {
        Scroll.set(x, y, doc.rawDoc);
        scrollCheck(x, y, doc);
      };

      var runTests = function (doc) {
        var mar = parseInt(Css.get(doc.body, 'margin'), 10);
        var x = 2500;
        var y = 2600;

        var scr0 = Scroll.get(doc.rawDoc);
        assert.eq(0, scr0.left());
        assert.eq(0, scr0.top());

        scrollTo(x, y, doc);

        var x2 = -1000;
        var y2 =  1000;
        Scroll.by(x2, y2, doc.rawDoc);
        var scr2 = Scroll.get(doc.rawDoc);
        assert.eq(x+x2, scr2.left());
        assert.eq(y+y2, scr2.top());

        var et = doc.byId('top1');
        Scroll.setToElement(doc.rawWin, et);
        var scr3 = Scroll.get(doc.rawDoc);
        assert.eq(mar, scr3.left());
        assert.eq(mar, scr3.top());

        var eb = doc.byId('bot1');
        Scroll.setToElement(doc.rawWin, eb);
        var scr4 = Scroll.get(doc.rawDoc);
        var y4 = 2*110 + 5010 + 15 - doc.rawWin.innerHeight;
        assert.eq(0, scr4.left());
        assert.eq(y4, scr4.top());

        // Back to center
        scrollTo(x, y, doc);
        Scroll.preserve(doc.rawDoc, function () {
          scrollTo(30, 40, doc);
        });
        scrollCheck(x, y, doc);

        // Back to center
        scrollTo(x, y, doc);
        var c1 = Scroll.capture(doc.rawDoc);
        scrollTo(3000, 4000, doc);
        c1.restore();
        scrollCheck(x, y, doc);
        scrollTo(500, 400, doc);
        c1.save();
        scrollTo(900, 900, doc);
        c1.restore();
        scrollCheck(500, 400, doc);

      };

      runTests(doc);
    };
  }
);