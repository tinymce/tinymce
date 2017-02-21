define(
  'ephox.sugar.api.selection.LtrRange',

  [
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.selection.Situ'
  ],

  function (Struct, Element, Situ) {
    var exact = Struct.immutable('start', 'soffset', 'finish', 'foffset');
    var relative = Struct.immutable('startSitu', 'finishSitu');

    var exactFromNative = function (range) {
      return exact(
        Element.fromDom(range.startContainer),
        range.startOffset,
        Element.fromDom(range.endContainer),
        range.endOffset
      )
    };

    var exactToNative = function (win, e) {
      var rng = win.document.createRange(); 
      rng.setStart(e.start().dom(), e.soffset());
      rng.setEnd(e.finish().dom(), e.foffset());
      return rng;
    }
    
    var relativeFromNative = function (range) {
      var start = Element.fromDom(range.startContainer);
      var finish = Element.fromDom(range.endContainer);
      return relative(
        Situ.on(start, range.startOffset),
        Situ.on(finish, range.endOffset)
      );
    };

    var relativeToNative = function (rel) {
      
    }

    return {
      exact: exact,
      relative: relative,
      exactFromNative: exactFromNative,
      exactToNative: exactToNative,
      relativeFromNative: relativeFromNative
    };

  }
);
