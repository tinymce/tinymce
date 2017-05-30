define(
  'tinymce.themes.mobile.util.FontSizes',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.TransformFind',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Arr, Fun, Option, Compare, Element, Node, Css, TransformFind, Traverse) {
    var candidates = [ '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '36px' ];

    var defaultSize = 'medium';
    var defaultIndex = 2;

    var indexToSize = function (index) {
      return Option.from(candidates[index]);
    };

    var sizeToIndex = function (size) {
      return Arr.findIndex(candidates, function (v) {
        return v === size;
      });
    };

    var getRawOrComputed = function (isRoot, rawStart) {
      var optStart = Node.isElement(rawStart) ? Option.some(rawStart) : Traverse.parent(rawStart);
      return optStart.map(function (start) {
        var inline = TransformFind.closest(start, function (elem) {
          return Css.getRaw(elem, 'font-size');
        }, isRoot);

        return inline.getOrThunk(function () {
          return Css.get(start, 'font-size');
        });
      }).getOr('');
    };

    var getSize = function (editor) {
      // This was taken from the tinymce approach (FontInfo is unlikely to be global)
      var node = editor.selection.getStart();
      var elem = Element.fromDom(node);
      var root = Element.fromDom(editor.getBody());

      var isRoot = function (e) {
        return Compare.eq(root, e);
      };

      var elemSize = getRawOrComputed(isRoot, elem);
      return Arr.find(candidates, function (size) {
        return elemSize === size;
      }).getOr(defaultSize);
    };

    var applySize = function (editor, value) {
      var currentValue = getSize(editor);
      if (currentValue !== value) {
        editor.execCommand('fontSize', false, value);
      }
    };

    var get = function (editor) {
      var size = getSize(editor);
      return sizeToIndex(size).getOr(defaultIndex);
    };

    var apply = function (editor, index) {
      indexToSize(index).each(function (size) {
        applySize(editor, size);
      });
    };

    return {
      candidates: Fun.constant(candidates),
      get: get,
      apply: apply
    };
  }
);
