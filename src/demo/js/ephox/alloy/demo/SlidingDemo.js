define(
  'ephox.alloy.demo.SlidingDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, Behaviour, Sliding, Button, Container, HtmlDisplay, Objects, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      HtmlDisplay.section(
        gui,
        'This container slides its height',
        Container.sketch({
          components: [
            Container.sketch({
              uid: 'height-slider',

              behaviours: Behaviour.derive([
                Sliding.config({
                  dimension: {
                    property: 'height'
                  },
                  closedStyle: 'demo-sliding-closed',
                  openStyle: 'demo-sliding-open',
                  shrinkingStyle: 'demo-sliding-height-shrinking',
                  growingStyle: 'demo-sliding-height-growing',
                  onShrunk: function () {
                    console.log('height.slider.shrunk');
                  },
                  onGrown: function () {
                    console.log('height.slider.grown');
                  }
                })
              ]),
              components: [
                Container.sketch({
                  dom: {
                    styles: { height: '100px', background: 'blue' }
                  }
                })
              ]
            }),

            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'Toggle'
              },
              action: function () {
                var slider = gui.getByUid('height-slider').getOrDie();
                if (Sliding.hasGrown(slider)) Sliding.shrink(slider);
                else Sliding.grow(slider);
              }
            })
          ]
        })
      );

      HtmlDisplay.section(
        gui,
        'This container slides its width',
        Container.sketch({
          components: [
            Container.sketch({
              uid: 'width-slider',

              behaviours: Behaviour.derive([
                Sliding.config({
                  dimension: {
                    property: 'width'
                  },
                  closedStyle: 'demo-sliding-closed',
                  openStyle: 'demo-sliding-open',
                  shrinkingStyle: 'demo-sliding-width-shrinking',
                  growingStyle: 'demo-sliding-width-growing',
                  onShrunk: function () {
                    console.log('width.slider.shrunk');
                  },
                  onGrown: function () {
                    console.log('width.slider.grown');
                  }
                })
              ]),
             
              components: [
                Container.sketch({
                  dom: {
                    styles: { height: '100px', background: 'blue' }
                  }
                })
              ]
            }),

            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'Toggle'
              },
              action: function () {
                var slider = gui.getByUid('width-slider').getOrDie();
                if (Sliding.hasGrown(slider)) Sliding.shrink(slider);
                else Sliding.grow(slider);
              }
            })
          ]
        })
      );
    };
  }
);