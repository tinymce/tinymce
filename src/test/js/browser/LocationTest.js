asynctest(
  'LocationTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.sand.api.PlatformDetection',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.dom.Remove'
  ],

  function (Arr, PlatformDetection, Option, Body, Css, DomEvent, Element, Insert, Location, Remove) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var asserteq = function (expected, actual, message) {
      // I wish assert.eq printed expected and actual on failure
      var m = message === undefined ? undefined : 'expected ' + expected + ', was ' + actual + ': ' + message;
      assert.eq(expected, actual, m);
    };

    var iframe = Element.fromHtml('<iframe style="height:100px; width:500px;" src="project/src/test/data/locationTest.html"></iframe>');
    Insert.append(Body.body(), iframe);
    var run = DomEvent.bind(iframe, 'load', function () {
      run.unbind();
      try {
        checks();
        success();
      } catch (e) {
        failure(e);
      } finally {
        Remove.remove(iframe);
      }
    });

    var checks = function () {
      var iframeWin = iframe.dom().contentWindow;
      var iframeDoc = iframeWin.document;
      var doc = {
        rawWin: iframeWin,
        rawDoc: Element.fromDom(iframeDoc),
        byId: function (str) {
          return Option.from(iframeDoc.getElementById(str))
                       .map(Element.fromDom)
                       .getOrDie('cannot find element with id ' + str);
        }
      };

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
      var tests = [
        { id: 'absolute-1',
          absolute: { top: 1, left: 1 },
          relative: { top: 1, left: 1 }, // JQuery returns 0/0
          viewport: { top: 1, left: 1 }
        },
        { id: 'absolute-1-1',
          absolute: { top: 5, left: 5 },
          relative: { top: 2, left: 2 }, // JQuery returns 1/1
          viewport: { top: 5, left: 5 }
        },
        { id: 'absolute-1-1-1',
          absolute: { top: 9, left: 9 },
          relative: { top: 2, left: 2 }, // JQuery returns 1/1
          viewport: { top: 9, left: 9 }
        },
        { id: 'absolute-2',
          absolute: { top: 20, left: 20 },
          relative: { top: 20, left: 20 }, // JQuery returns 19/19
          viewport: { top: 20, left: 20 }
        },
        { id: 'positionTest',
          absolute: { top: 10, left: 10 },
          relative: { top: 10, left: 10 },
          viewport: { top: 10, left: 10 }
        }
      ];

      runChecks(doc, tests);
    };

    var relativeChecks = function (doc) {
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var tests = [
        { id: 'relative-1',
          absolute: { top: 7, left: 7 },
          relative: { top: 7, left: 7 }, // JQuery returns 6/6
          viewport: { top: 7, left: 7 }
        },
        { id: 'relative-1-1',
          absolute: { top: 15, left: 15 },
          relative: { top:  6, left:  6 }, // JQuery returns 5/5
          viewport: { top: 15, left: 15 }
        },
        { id: 'relative-1-1-1',
          absolute: { top: 23, left: 23 },
          relative: { top:  6, left:  6 }, // JQuery returns 5/5
          viewport: { top: 23, left: 23 }
        },
        { id: 'relative-2',
          absolute: { top: 142, left: 27 },
          relative: { top: 142, left: 27 }, // JQuery returns 141/26
          viewport: { top: 142, left: 27 }
        },

        // This simulates a docked ego state for the toolbars
        { id: 'relative-toolbar-container',
          absolute: { top: 685, left: 6 },
          relative: { top: 685, left: 6 },
          viewport: { top: 685, left: 6 }
        },
        { id: 'relative-toolbar',
          absolute: { top: 685 - 40, left: 6 },
          relative: { top: -40, left: 0 },
          viewport: { top: 685 - 40, left: 6 }
        }
      ];

      runChecks(doc, tests);
    };

    var staticChecks = function (doc) {
      var extraHeight = 230; // because all tests are in one page
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var tests = [
        { id: 'static-1',
          absolute: { top: extraHeight + 7, left: 7 },
          relative: { top: extraHeight + 7, left: 7 }, // JQuery returns +6/6
          viewport: { top: extraHeight + 7, left: 7 }
        },
        { id: 'static-1-1',
          absolute: { top: extraHeight + 15, left: 15 },
          relative: { top: extraHeight + 15, left: 15 }, // JQuery returns +14/14
          viewport: { top: extraHeight + 15, left: 15 }
        },
        { id: 'static-1-1-1',
          absolute: { top: extraHeight + 23, left: 23 },
          relative: { top: extraHeight + 23, left: 23 }, // JQuery returns +22/22
          viewport: { top: extraHeight + 23, left: 23 }
        },
        { id: 'static-2',
          absolute: { top: extraHeight + 122, left: 7 },
          relative: { top: extraHeight + 122, left: 7 }, // JQuery returns +121/6
          viewport: { top: extraHeight + 122, left: 7 }
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
        { id: 'table-1',
          absolute: { top: extraHeight + 7, left: 6 },
          relative: { top: extraHeight + 7, left: 6 },
          viewport: { top: extraHeight + 7, left: 6 }
        },
        { id: 'th-1',
          absolute: { top: extraHeight + 11, left: 10 },
          relative: { top: 4,                left: 4 },  // JQuery returns extraHeight + 11/10, but that's nonsense
          viewport: { top: extraHeight + 11, left: 10 }
        },
        { id: 'th-3',
          absolute: { top: extraHeight + 11, left: 222 },
          relative: { top: 4,                left: 216 },  // JQuery returns extraHeight + 11/222, but that's nonsense
          viewport: { top: extraHeight + 11, left: 222 }
        },
        { id: 'td-1',
          absolute: { top: extraHeight + 117, left: 10 },
          relative: { top: 110,               left: 4 },  // JQuery returns extraHeight + 117/10, but that's nonsense
          viewport: { top: extraHeight + 117, left: 10 }
        },
        { id: 'td-3',
          absolute: { top: extraHeight + 117, left: 222 },
          relative: { top: 110,               left: 216 },  // JQuery returns extraHeight + 117/222, but that's nonsense
          viewport: { top: extraHeight + 117, left: 222 }
        }
      ];

      // Chrome has a weird 2px bug where the offsetTop of a table cell is 2px less than every other browser, even though
      // the difference between table.getBoundingClientRect() and cell.getBoundingClientRect() is correct.
      // I don't want to make every browser pay for Chrome's mistake in a scenario we don't need for TBIO, so we're living with it.
      if (PlatformDetection.detect().browser.isChrome()) {
        var chromeDifference = -2;
        Arr.each(tests, function (t) {
          if (t.id !== 'table-1') {
            t.relative.top += chromeDifference;
            t.relative.left += chromeDifference;
          }
        });
      }

      runChecks(doc, tests);
    };

    var fixedChecks = function (doc) {
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var noScroll = [
        { id: 'fixed-1',
          absolute: { top: 1, left: 1 },
          relative: { top: 1, left: 1 }, // JQuery returns 0/0
          viewport: { top: 1, left: 1 }
        },
        { id: 'fixed-2',
          absolute: { top: 21, left: 21 },
          relative: { top: 21, left: 21 }, // JQuery returns 20/20
          viewport: { top: 21, left: 21 }
        },
        { id: 'fixed-no-top-left',
          absolute: { top: 7, left: 7 },
          relative: { top: 7, left: 7 }, // JQuery returns 6/6
          viewport: { top: 7, left: 7 }
        }
      ];

      var leftScroll = 1000;
      var topScroll = 2000;
      // GUESS: 1px differences from JQuery is due to the 1px margin on the body
      var withScroll = [
        { id: 'fixed-1',
          absolute: { top: topScroll + 1, left: leftScroll + 1 },
          relative: { top: 1, left: 1 }, // JQuery returns 0/0
          viewport: { top: 1, left: 1 }
        },
        { id: 'fixed-2',
          absolute: { top: topScroll + 21, left: leftScroll + 21 },
          relative: { top: 21, left: 21 }, // JQuery returns 20/20
          viewport: { top: 21, left: 21 }
        },
        { id: 'fixed-no-top-left',
          absolute: { top: topScroll + 7, left: leftScroll + 7 },
          relative: { top: 7, left: 7 }, // JQuery returns 6/6
          viewport: { top: 7, left: 7 }
        }
      ];

      var afterSetPosition = [
        { id: 'fixed-no-top-left',
          absolute: { top: topScroll + 11, left: leftScroll + 21 },
          relative: { top: 11, left: 21 }, // JQuery returns 10/20
          viewport: { top: 11, left: 21 }
        }
      ];

      runChecks(doc, noScroll);

      doc.rawWin.scrollTo(leftScroll,topScroll);
      runChecks(doc, withScroll);

      Css.setAll(doc.byId('fixed-no-top-left'), { top: '10px', left: '20px' });
      runChecks(doc, afterSetPosition);
    };

    /* Simple verification logic */
    var runChecks = function (doc, tests) {
      Arr.each(tests, function (t) {
        var div = doc.byId(t.id);

        var pos = Location.absolute(div);
        asserteq(t.absolute.top,  pos.top(),  '.absolute().top  ' + t.id);
        asserteq(t.absolute.left, pos.left(), '.absolute().left ' + t.id);
        pos = Location.relative(div);
        asserteq(t.relative.top,  pos.top(),  '.relative().top  ' + t.id);
        asserteq(t.relative.left, pos.left(), '.relative().left ' + t.id);
        pos = Location.viewport(div);
        asserteq(t.viewport.top,  pos.top(),  '.viewport().top  ' + t.id);
        asserteq(t.viewport.left, pos.left(), '.viewport().left ' + t.id);
      });
    };
  }
);