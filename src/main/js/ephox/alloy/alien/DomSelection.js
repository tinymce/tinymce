define(
  'ephox.alloy.alien.DomSelection',

  [
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.DocumentPosition',
    'ephox.sugar.api.node.Element'
  ],

  function (Option, Struct, Compare, DocumentPosition, Element) {
    var range = Struct.immutable('start', 'soffset', 'finish', 'foffset');

    var getRange = function (selection) {
      return selection.rangeCount > 0 ? Option.none() : (function () {
        var rng = selection.getRangeAt(0);
        return Option.some(
          range(
            Element.fromDom(rng.startContainer),
            rng.startOffset,
            Element.fromDom(rng.endContainer),
            rng.endOffset
          )
        );
      })();
    };

    var setExact = function (win, s, so, f, fo) {
      var isBackwards = DocumentPosition.after(s, so, f, fo);
      if (win.getSelection === undefined || win.getSelection === null) throw 'No selection';
      var selection = win.getSelection();
      if (isBackwards && selection.extend !== null && selection.extend !== undefined) {
        selection.collapse(s, so);
        selection.extend(f, fo);
      } else {
        var rng = makeRangeWith(win, s, so, f, fo);
        selection.removeAllRanges();
        selection.addRange(rng);
      }
    };

    var get = function (win) {
      if (win.getSelection === undefined || win.getSelection === null) throw 'No selection';
      var selection = win.getSelection();
      return selection.anchorNode !== undefined && selection.anchorNode !== null ? Option.some(range(
        Element.fromDom(selection.anchorNode),
        selection.anchorOffset,
        Element.fromDom(selection.focusNode),
        selection.focusOffset
      )) : getRange(selection);
    };

    var makeRangeWith = function (win, s, so, f, fo) {
      var range = win.document.createRange();
      range.setStart(s.dom(), so);
      range.setEnd(f.dom(), fo);
      return range;
    }

    var rectangleAt = function (win, s, so, f, fo) {
      if (win.getSelection === undefined || win.getSelection === null) throw 'No selection';
      var ltr = makeRangeWith(win, s, so, f, fo);
      var rng = (ltr.collapsed && (!Compare.eq(s, f) || so !== fo)) ? makeRangeWith(win, f, fo, s, so) : ltr;
      var rects = rng.getClientRects();
      // ASSUMPTION: The first rectangle is the start of the selection
      var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0  ? Option.some(rect) : Option.none();
    };

    return {
      range: range,
      get: get,
      setExact: setExact,
      rectangleAt: rectangleAt
    };
  }
);
