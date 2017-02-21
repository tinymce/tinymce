define(
  'ephox.sugar.selection.core.SelectionDirection',

  [
    'ephox.katamari.api.Adt',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.selection.core.NativeRange'
  ],

  function (Adt, Element, NativeRange) {
    var adt = Adt.generate([
      { ltr: [ 'start', 'soffset', 'finish', 'foffset' ] },
      { rtl: [ 'start', 'soffset', 'finish', 'foffset' ] }
    ]);

    var fromRange = function (win, type, range) {
      return type(Element.fromDom(range.startContainer), range.startOffset, Element.fromDom(range.endContainer), range.endOffset);
    };

    var diagnose = function (win, relative) {
      // If we cannot create a ranged selection from start > finish, it could be RTL
      var rng = NativeRange.relativeToNative(win, relative.startSitu(), relative.finishSitu());
      if (rng.collapsed) {
        // Let's check if it's RTL ... if it is, then reversing the direction will not be collapsed
        var reversed = NativeRange.relativeToNative(win, relative.finishSitu(), relative.startSitu());
        if (reversed.collapsed) return fromRange(win, adt.ltr, rng);
        // We need to use "reversed" here, because the original only has one point (collapsed)
        else return adt.rtl(
          Element.fromDom(reversed.endContainer),
          reversed.endOffset,
          Element.fromDom(reversed.startContainer),
          reversed.startOffset
        );
      } else {
        return fromRange(win, adt.ltr, rng);
      }
    };

    var asLtrRange = function (win, subject) {
      return subject.match({
        ltr: function (start, soffset, finish, foffset) {
          var rng = win.document.createRange();
          rng.setStart(start.dom(), soffset);
          rng.setEnd(finish.dom(), foffset);
          return rng;
        },
        rtl: function (start, soffset, finish, foffset) {
          // NOTE: Reversing start and finish
          var rng = win.document.createRange();
          rng.setStart(finish.dom(), foffset);
          rng.setEnd(start.dom(), soffset);
          return rng;
        }
      });
    };

    return {
      ltr: adt.ltr,
      rtl: adt.rtl,
      diagnose: diagnose,
      asLtrRange: asLtrRange
    };
  }
);
