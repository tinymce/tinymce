define(
  'tinymce.themes.mobile.util.FontSizes',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'tinymce.core.fmt.FontInfo'
  ],

  function (Arr, Fun, Option, FontInfo) {
    var candidates = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

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

    var getSize = function (editor) {
      var node = editor.selection.getStart();
      var px = FontInfo.getFontSize(editor.getBody(), node);
      var pt = FontInfo.toPt(px);

      return Arr.find(candidates, function (size) {
        return px === size || pt === size;
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
