define(
  'ephox.darwin.api.Darwin',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.Point',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.dom.DomDescent',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse',
    'global!Math'
  ],

  function (Rectangles, PlatformDetection, Point, SelectionRange, Situ, WindowSelection, Awareness, Option, Spot, DomDescent, DomGather, Attr, Node, Traverse, Math) {
    var platform = PlatformDetection.detect();

    var getSpot = function () {
	    return WindowSelection.get(window).bind(function (sel) {
        var start = DomDescent.toLeaf(sel.start(), sel.soffset());
        var finish = DomDescent.toLeaf(sel.finish(), sel.foffset());
        console.log('range: ', start.element().dom(), start.offset(), finish.element().dom(), finish.offset());
	      return WindowSelection.rectangleAt(window, start.element(), start.offset(), finish.element(), finish.offset());
	    });
	  };

    // In Firefox, it isn't giving you the next element ... it's giving you the current element. So if the box of where it gives you has the same y value
    // minus some error, try again with a bigger jump.
    var firefoxAgain = function (spot) {
      return Point.find(window, spot.left, spot.bottom + 5).bind(function (pt) {
        return pt.start().fold(Option.none, function (e, eo) {
          var box = Rectangles.getBox(window, e, eo);
          if (Math.abs(box.top - spot.top) < 10) {
            return firefoxAgain({ left: spot.left, bottom: spot.bottom + 5, top: spot.top + 5 }).orThunk(function () {
              return Option.some(pt);
            });
          }

          return mogel(pt, box, spot);
        }, Option.none);
      });
    };

    var mogel = function (pt, box, spot) {
      if (box.top <= ((spot.top + spot.bottom) / 2) && box.bottom >= ((spot.top + spot.bottom) / 2)) {
        console.log('try again lower down');
        return webkitAgain({ left: spot.left, bottom: spot.bottom + 5 });
      }

      if (box.top > spot.bottom + 5) {
        return Point.find(window, spot.left, box.top + 1).orThunk(function () { return Option.some(pt); });
      } else {
        return Option.some(pt);
      }
    };

    // The process is that you incrementally go down ... if you find the next element, but your top is not at that element's bounding rect.
    // then try again with the same x but the box's y
    var webkitAgain = function (spot) {
      return Point.find(window, spot.left, spot.bottom + 5).bind(function (pt) {
        return pt.start().fold(Option.none, function (e, eo) {
          var box = Rectangles.getBox(window, e, eo);
          // If the box that it returned does not contain the spot, move the spot to within the box and try again
          // this is an attempt to get a more reliable offset

          console.log('comparison of (box.top= ' + box.top + ') to (spot.bottom=' + spot.bottom + ')');
          console.log('box: ', box);

          // If we are at the same point that we started ... then we have to keep looking lower down.
          return mogel(pt, box, spot);
          // if (box.top <= ((spot.top + spot.bottom) / 2) && box.bottom >= ((spot.top + spot.bottom) / 2)) {
          //   console.log('try again lower down');
          //   return webkitAgain({ left: spot.left, bottom: spot.bottom + 5 });
          // }

          // if (box.top > spot.bottom + 5) {
          //   return Point.find(window, spot.left, box.top + 1).orThunk(function () { return Option.some(pt); });
          // } else {
          //   return Option.some(pt);
          // }
        }, Option.none);

      });
    };

    var ieAgain = function (spot) {
      return Point.find(window, spot.left, spot.bottom + 5);
    };

    var calc = function (spot) {
      if (platform.browser.isChrome() || platform.browser.isSafari()) return webkitAgain(spot);
      else if (platform.browser.isFirefox()) return firefoxAgain(spot);
      else if (platform.browser.isIE()) return ieAgain(spot);
      else return Option.none();
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
      handler: handler
    };
  }
);
