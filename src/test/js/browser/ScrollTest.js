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
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Scroll',
    'ephox.sugar.api.view.Width',
    'global!Math'
  ],

  function (Fun, Option, PlatformDetection, Insert, Remove, DomEvent, Body, Element, Attr, Css, Height, Location, Scroll, Width, Math) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var browser = PlatformDetection.detect().browser;

    if (!Math.sign) { // For IE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
      Math.sign = function(x) {
        return ((x > 0) - (x < 0)) || +x;
      };
    }

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
            html: html,
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
      Insert.append(Body.body(), iframe);
    };

    var ifr = '<iframe src="project/src/test/data/scrollTest.html"></iframe>';
    testOne(ifr, { // vanilla iframe
      iframe: { id: 'vanilla', style: 'height:200px; width:500px; border: 7px dotted chartreuse;' },
      html: Option.none(),
      body: Option.some({ contenteditable: 'true', style: 'margin: 0; padding: 5px;' })
    },
      function () {
        testOne(ifr, { // rtl iframe
          iframe: { id: 'rtl', style: 'height:200px; width:500px; border: 7px solid blueviolet;' },
          html: Option.none(),
          body: Option.some({ dir: 'rtl', contenteditable: 'true', style: 'margin: 0; padding: 5px;' })
        },
          success);
      });

    var within = function (a, b, eps) {
      return Math.abs(a - b) <= eps;
    };

    // check current scroll position is at (x,y) (or within +/- (epsX, epsY))
    var scrollCheck = function (x, y, epsX, epsY, doc, msg) {
      Css.reflow(doc.body);
      var scr = Scroll.get(doc.rawDoc);
      assert.eq(true, within(x, scr.left(), epsX) , msg + ' (' + doc.dir + ') Expected scrollCheck x=' + x + ', got=' + scr.left() + ', eps=' + epsX);
      assert.eq(true, within(y, scr.top(), epsY), msg + ' (' + doc.dir + ') Expected scrollCheck y=' + y + ', got=' + scr.top() + ', eps=' + epsY);
    };

    // scroll to (x,y) and check position
    var scrollTo = function (x, y, doc) {
      Scroll.set(x, y, doc.rawDoc);
      scrollCheck(x, y, 0, 0, doc, 'scrollTo(' + x + ',' + y + ')');
    };

    // set the scroll to location of element 'el' and check position
    var setToElement = function (doc, el, x, y, epsX, epsY, msg) {
      Scroll.setToElement(doc.rawWin, el);
      scrollCheck(x, y, epsX, epsY, doc, msg);
    };

    var scrollBy = function (x, y, doc, msg) {
      var scr0 = Scroll.get(doc.rawDoc);
      Scroll.by(x, y, doc.rawDoc);
      scrollCheck(scr0.left() + x, scr0.top() + y, 0, 0, doc, 'scrollBy(' + x + ',' + y + '): ' + msg);
    };

    var runTests = function (doc) {
      var mar0 = Css.get(doc.html, 'margin');
      var bod0 = Css.get(doc.body, 'border');
      var bodyBorder = parseInt(bod0, 10) || 0;
      var mar = parseInt(mar0, 10) || 0;
      var hgt = doc.body.dom().scrollHeight;
      var scrollBarWidth = Scroll.scrollBarWidth();
      var cEl = doc.byId('centre1');
      var center = Location.absolute(cEl);
      var cX = Math.round(center.left());
      var cY = Math.round(center.top());

      assert.eq(true, scrollBarWidth > 5 && scrollBarWidth < 50, 'scroll bar width, got=' + scrollBarWidth);

      scrollCheck(0, 0, 0, 0, doc, 'start pos');

      //  TBIO-5131 - skip tests for IE and EDGE RTL (x coords go -ve from left to right on the screen in RTL mode)
      if ( !(doc.rtl && (browser.isIE() || browser.isEdge())) ) {

        var cPos = Location.absolute(cEl);
        setToElement(doc, cEl, cPos.left(), cPos.top(), 1, 1, 'set to centre el');

        // scroll text of the centre cell into view (right-aligned in RTL mode)
        var x = cX + (doc.rtl ?  (Width.get(cEl) - Width.get(doc.iframe)): 0);
        scrollTo(x, cY, doc); // scroll back to centre

        scrollBy(-50, 30, doc, 'scrollBy/1');
        scrollBy(50, -30, doc, 'scrollBy/2');

        scrollCheck(x, cY, 0, 0, doc, 'reset/2');

        // scroll to top el
        var pos = Location.absolute(doc.byId('top1'));
        setToElement(doc, doc.byId('top1'), pos.left(), pos.top(), 0, 0, 'set to top');

        scrollTo(x, cY, doc); // scroll back to centre

        // scroll to bottom el
        var bot1Pos = Location.absolute(doc.byId('top1'));
        var bot = hgt + 2 * bodyBorder + 2 * mar - (doc.rawWin.innerHeight - scrollBarWidth); // content height minus viewport-excluding-the-bottom-scrollbar
        setToElement(doc, doc.byId('bot1'), bot1Pos.left(), bot, 0, 20, 'set to bottom');

        scrollTo(x, cY, doc); // scroll back to centre
        Scroll.preserve(doc.rawDoc, function () {
          scrollBy( 100, 100, doc); // scroll some where else
        });
        scrollCheck(x, cY, 0, 0, doc, 'preserve'); // scroll back at centre

        var c1 = Scroll.capture(doc.rawDoc);
        scrollBy( 100, 100, doc); // scroll some where else
        c1.restore();
        scrollCheck(x, cY, 0, 0, doc, 'restore #1');
        scrollBy( -100, -100, doc);
        c1.save();
        scrollBy(50, 50, doc);
        c1.restore();
        scrollCheck(x - 100, cY - 100, 0, 0, doc, 'restore #2');
      }
    };
  }
);