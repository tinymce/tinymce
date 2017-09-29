define(
  'tinymce.themes.mobile.ui.FontSizeSlider',

  [
    'tinymce.themes.mobile.ui.SizeSlider',
    'tinymce.themes.mobile.ui.ToolbarWidgets',
    'tinymce.themes.mobile.util.FontSizes',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],


  function (SizeSlider, ToolbarWidgets, FontSizes, UiDomFactory) {
    var sizes = FontSizes.candidates();

    var makeSlider = function (spec) {
      return SizeSlider.sketch({
        onChange: spec.onChange,
        sizes: sizes,
        category: 'font',
        getInitialValue: spec.getInitialValue
      });
    };

    var makeItems = function (spec) {
      return [
        UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
        makeSlider(spec),
        UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
      ];
    };

    var sketch = function (realm, editor) {
      var spec = {
        onChange: function (value) {
          FontSizes.apply(editor, value);
        },
        getInitialValue: function (/* slider */) {
          return FontSizes.get(editor);
        }
      };

      return ToolbarWidgets.button(realm, 'font-size', function () {
        return makeItems(spec);
      });
    };

    return {
      makeItems: makeItems,
      sketch: sketch
    };
  }
);
