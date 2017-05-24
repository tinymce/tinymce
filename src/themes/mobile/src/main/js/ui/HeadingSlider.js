define(
  'tinymce.themes.mobile.ui.HeadingSlider',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Slider',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.TransformFind',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.ToolbarWidgets'
  ],

  function (Behaviour, Replacing, Toggling, GuiFactory, Slider, Arr, Compare, Element, Node, TransformFind, Styles, ToolbarWidgets) {
    var headings = [ 'p', 'h3', 'h2', 'h1' ];

    var isValidValue = function (valueIndex) {
      return valueIndex >= 0 && valueIndex < headings.length;
    };

    var makeSlider = function (spec) {
      var onChange = function (slider, thumb, valueIndex) {
        // Slider has index headings
        if (isValidValue(valueIndex)) {
          spec.onChange(slider, thumb, valueIndex);
        }
      };

      var onInit = function (slider, thumb, valueIndex) {
        // Slider has index headings
        if (isValidValue(valueIndex)) {
          spec.onInit(slider, thumb, valueIndex);
        }
      };

      return Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('slider-heading-container'), Styles.resolve('slider') ]
        },
        onChange: onChange,
        onInit: onInit,
        onDragStart: function (thumb) {
          Toggling.on(thumb);
        },
        onDragEnd: function (thumb) {
          Toggling.off(thumb);
        },
        min: 0,
        max: headings.length - 1,
        stepSize: 1,
        getInitialValue: spec.getInitialValue,
        snapToGrid: true,

        components: [
          Slider.parts().spectrum(),
          Slider.parts().thumb()
        ],

        parts: {
          spectrum: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-heading-spectrum') ]
            },
            components: [
              {
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('slider-heading-spectrum-line') ]
                }
              }
            ]
          },
          thumb: {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('slider-thumb') ]
            },
            behaviours: Behaviour.derive([
              Replacing.config({ }),
              Toggling.config({
                toggleClass: 'selected'
              })
            ])
          }
        }
      });
    };


    var sketch = function (realm, editor) {
      var updateThumb = function (_slider, thumb, value) {
        Replacing.set(thumb, [
          GuiFactory.text(headings[value].toUpperCase())
        ]);
      };

      var spec = {
        onChange: function (slider, thumb, value) {
          updateThumb(slider, thumb, value);
          editor.execCommand('FormatBlock', null, headings[value].toLowerCase());
        },
        onInit: updateThumb,
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
        return [ makeSlider(spec) ];
      });
    };

    return {
      sketch: sketch
    };
  }
);