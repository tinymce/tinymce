define(
  'ephox.darwin.api.Darwin',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.darwin.keyboard.Retries',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.dom.DomDescent',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse',
    'global!Math'
  ],

  function (Rectangles, Retries, PlatformDetection, SelectionRange, Situ, WindowSelection, Option, DomDescent, DomGather, Attr, Node, Traverse, Math) {
    var platform = PlatformDetection.detect();

    var getSpot = function () {
	    return WindowSelection.get(window).bind(function (sel) {
        if (WindowSelection.isCollapsed(sel.start(), sel.soffset(), sel.finish(), sel.foffset())) {
          return Rectangles.getBox(window, sel.start(), sel.soffset());
        } else {
          var start = DomDescent.toLeaf(sel.start(), sel.soffset());
          var finish = DomDescent.toLeaf(sel.finish(), sel.foffset());
          return WindowSelection.rectangleAt(window, start.element(), start.offset(), finish.element(), finish.offset());
        }
      });
	  };

    var calc = function (spot) {
      if (platform.browser.isChrome() || platform.browser.isSafari()) return Retries.tryDown(window, spot);
      else if (platform.browser.isFirefox()) return Retries.tryDown(window, spot);
      else if (platform.browser.isIE()) return Retries.ieTryDown(window, spot);
      else return Option.none();
    };


    var tryDown = function (win, isRoot, element, offset) {
      return Rectangles.getBox(win, element, offset).bind(function (box) {
        return calc(box);
      });
    };

    var handler = function (event) {
      getSpot().each(function (spot) {
        // updateLogbook('x: ' + spot.left + ', y: ' + spot.bottom);
      });

      if (event.raw().which === 40) {
        WindowSelection.get(window).bind(function (sel) {
          return Node.isElement(sel.start()) ? Traverse.child(sel.start(), sel.soffset()).filter(function (child) { return Node.name(child) === 'br'; }) :Option.none();
        }).fold(function () {


          getSpot().bind(function (spot) {
            return calc(spot);
          }).fold(function () {
            console.log('did not handle');
          }, function (pt) {
            console.log('handled: ', pt);
            WindowSelection.set(window, pt);
            // updateLogbook(10);
          });

        }, function (child) {
          console.log("handling br");
          DomGather.after(child, function (elem) {
            return Attr.has(elem, 'contenteditable');
          }).fold(function () {
            console.log('*************************************************** nope *******************');
          }, function (next) {
            console.log('after ', child.dom(), ' was ', next.dom());
            WindowSelection.set(window, SelectionRange.write(Situ.before(next), Situ.before(next)));
          })

        });
        // down
        event.kill();
      }

    };

    return {
      handler: handler,
      tryDown: tryDown
    };
  }
);
