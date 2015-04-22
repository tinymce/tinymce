define(
  'ephox.darwin.demo.DarwinDemo',

  [
    'ephox.fussy.api.Point',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFind',
    'global!Date'
  ],

  function (Point, WindowSelection, Awareness, Fun, Option, Attr, Css, DomEvent, Element, Html, Insert, Node, SelectorFind, Date) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var editor = Element.fromTag('div');
      Attr.set(editor, 'contenteditable', 'true');
      Css.set(editor, 'width', '400px');

      Html.set(editor, '<p>This is a paragraph</p><h1>This is a heading</h1><p>This is another paragraph that has multiple lines, probably ' + 
        'because there is a lot of content here and it makes sense that we would have quite a lot of stuff here ... and there is more of what ' + 
        'you are going to do even if it does not matter. And some br tags are about to appear <br /><br /><br />More of what you are going to do'
      );


      var logbook = Element.fromTag('div');
      Css.setAll(logbook, {
        width: '800px',
        float: 'right',
        height: '300px',
        overflow: 'scroll',
        border: '1px solid #333'
      });

      Insert.append(ephoxUi, editor);
      Insert.append(ephoxUi, logbook);

      var updateLogbook = function (msg) {
        var pre = Element.fromHtml('<p>' + new Date().toString() + ': ' + msg + '</p>');
        Insert.prepend(logbook, pre);
      };

      var getSpot = function () {
        return WindowSelection.get(window).bind(function (sel) {
          return WindowSelection.rectangleAt(window, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
        });
      };

      var calc = function (spot) {
        // The process is that you incrementally go down ... if you find the next element, but your top is not at that element's bounding rect.
        // then try again with the same y, but 
        return Point.find(window, spot.left, spot.bottom + 5).bind(function (pt) {
          return pt.start().fold(Option.none, function (e, eo) {
            // Try again with the bounding client rectangle.
            var box = getBox(e, eo);
            if (box.top > spot.bottom + 5) {
              return Point.find(window, spot.left, box.top + 1);
            } else {
              return Option.some(pt);
            }
          }, Option.none);
        });
      };

      var getBox = function (element, offset) {
        if (Node.isElement(element)) return element.dom().getBoundingClientRect();
        else {
          if (offset === 0 && offset < Awareness.getEnd(element)) {
            var rng = document.createRange();
            rng.setStart(element.dom(), offset);
            rng.setEnd(element.dom(), offset + 1);
            return rng.getBoundingClientRect();
          } else if (offset > 1) {
            var rng2 = document.createRange();
            rng2.setStart(element.dom(), offset - 1);
            rng2.setEnd(element.dom(), offset);
            return rng2.getBoundingClientRect();
          } else {
            throw 'cattle';
          }
        }
      };


      DomEvent.bind(editor, 'keydown', function (event) {
        getSpot().each(function (spot) {
          updateLogbook('x: ' + spot.left + ', y: ' + spot.bottom);
        });

        if (event.raw().which === 40) {
          getSpot().bind(function (spot) {
            return calc(spot);
          }).fold(function () {
            console.log('did not handle');
          }, function (pt) {
            console.log('handled: ', pt);
            WindowSelection.set(window, pt);
            updateLogbook(10);
          });
          // down
          event.kill();
        }
        
      });

      var paragraphRange = document.createRange();
      var paragraph = editor.dom().childNodes[2];
      console.log('paragraph', paragraph);
      paragraphRange.setStart(paragraph, 1);
      paragraphRange.setEnd(paragraph, 2);

      console.log('p-range', paragraphRange);

      updateLogbook('ranged br: height: ' + paragraphRange.getBoundingClientRect().height +  ' top: ' + paragraphRange.getBoundingClientRect().top);
      updateLogbook('br: height: ' + paragraph.childNodes[1].getBoundingClientRect().height +  ' top: ' + paragraph.childNodes[1].getBoundingClientRect().top);


    };
  }
);
