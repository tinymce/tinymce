define(
  'tinymce.themes.mobile.ui.HeadingSlider',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.TransformFind',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.SizeSlider',
    'tinymce.themes.mobile.ui.ToolbarWidgets'
  ],

  function (Arr, Compare, Element, Node, TransformFind, Styles, SizeSlider, ToolbarWidgets) {
    var headings = [ 'p', 'h3', 'h2', 'h1' ];

    var makeSlider = function (spec) {
      return SizeSlider.sketch({
        category: 'heading',
        sizes: headings,
        onChange: spec.onChange,
        getInitialValue: spec.getInitialValue
      });
    };

    var sketch = function (realm, editor) {
      var spec = {
        onChange: function (value) {
          editor.execCommand('FormatBlock', null, headings[value].toLowerCase());
        },
        getInitialValue: function () {
          var node = editor.selection.getStart();
          var elem = Element.fromDom(node);
          return TransformFind.closest(elem, function (e) {
            var nodeName = Node.name(e);
            return Arr.indexOf(headings, nodeName);
          }, function (e) {
            return Compare.eq(e, Element.fromDom(editor.getBody()));
          }).getOr(0);
        }
      };

      return ToolbarWidgets.button(realm, 'heading', function () {
        return [
          {
            dom: {
              tag: 'span',
              classes: [ Styles.resolve('toolbar-button'), Styles.resolve('icon-small-heading'), Styles.resolve('icon') ]
            }
          },
          makeSlider(spec),
          {
            dom: {
              tag: 'span',
              classes: [ Styles.resolve('toolbar-button'), Styles.resolve('icon-large-heading'), Styles.resolve('icon') ]
            }
          }
        ];
      });
    };

    return {
      sketch: sketch
    };
  }
);