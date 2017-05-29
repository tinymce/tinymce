define(
  'tinymce.themes.mobile.ui.FontSizeSlider',

  [
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.SizeSlider',
    'tinymce.themes.mobile.ui.ToolbarWidgets',
    'tinymce.themes.mobile.util.FontSizes'
  ],

  function (Styles, SizeSlider, ToolbarWidgets, FontSizes) {
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
        {
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-button'), Styles.resolve('icon-small-font'), Styles.resolve('icon') ]
          }
        },
        makeSlider(spec),
        {
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-button'), Styles.resolve('icon-large-font'), Styles.resolve('icon') ]
          }
        }
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
