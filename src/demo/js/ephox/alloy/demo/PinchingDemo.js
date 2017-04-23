define(
  'ephox.alloy.demo.PinchingDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Pinching',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Width'
  ],

  function (Behaviour, Pinching, GuiFactory, Attachment, Gui, Insert, Css, SelectorFind, Height, Width) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      // Naive resize handler
      var resize = function (element, changeX, changeY) {
        var width = Css.getRaw(element, 'width').map(function (w) {
          return parseInt(w, 10);
        }).getOrThunk(function () {
          return Width.get(element);
        });

        var height = Css.getRaw(element, 'height').map(function (h) {
          return parseInt(h, 10);
        }).getOrThunk(function () {
          return Height.get(element);
        });

        Css.set(element, 'width', (width + changeX) + 'px');
        Css.set(element, 'height', (height + changeY) + 'px');
      };

      var box = GuiFactory.build({
        dom: {
          tag: 'div',
          classes: [ 'demo-pinch-box' ],
          styles: {
            width: '200px',
            height: '200px',
            background: 'black'
          }
        },
        behaviours: Behaviour.derive([
          Pinching.config({
            onPinch: function (span, changeX, changeY) {
              resize(span, changeX, changeY);
            },
            onPunch: function (span, changeX, changeY) {
              resize(span, changeX, changeY);
            }
          })
        ])
      });

      var gui = Gui.create();
      gui.add(box);

      Attachment.attachSystem(ephoxUi, gui);
    };
  }
);
