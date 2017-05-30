define(
  'tinymce.themes.mobile.ui.HeadingSlider',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.TransformFind',
    'tinymce.themes.mobile.ui.SizeSlider',
    'tinymce.themes.mobile.ui.ToolbarWidgets',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Arr, Compare, Element, Node, TransformFind, SizeSlider, ToolbarWidgets, UiDomFactory) {
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
          UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-heading ${prefix}-icon"></span>'),
          makeSlider(spec),
          UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-heading ${prefix}-icon"></span>')
        ];
      });
    };

    return {
      sketch: sketch
    };
  }
);