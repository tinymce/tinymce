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
      return type(win, Element.from(range.startContainer), range.startOffset, Element.fromDom(range.endContainer), range.endOffset);
    };

    var diagnose = function (win, relative) {
      // If we cannot create a ranged selection from start > finish, it could be RTL
      var rng = NativeRange.relativeToNative(win, relative.start(), relative.finish());
      if (rng.collapsed) {
        // Let's check if it's RTL ... if it is, then reversing the direction will not be collapsed
        var reversed = NativeRange.relativeToNative(win, relative.finish(), relative.start());
        var type = reversed.collapsed === true ? adt.ltr : adt.rtl;
        return fromRange(win, type, rng);
      } else {
        return fromRange(win, adt.rtl, rng);
      }
    };

    return {
      ltr: adt.ltr,
      rtl: adt.rtl,
      diagnose: diagnose
    };
  }
);
