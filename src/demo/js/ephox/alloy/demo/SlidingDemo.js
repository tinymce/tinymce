define(
  'ephox.alloy.demo.SlidingDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!document'
  ],

  function (Behaviour, Sliding, Attachment, Gui, Button, Container, HtmlDisplay, Element, Class, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      HtmlDisplay.section(
        gui,
        'This container slides its height',
        Container.sketch({
          components: [
            Container.sketch({
              uid: 'height-slider',

              containerBehaviours: Behaviour.derive([
                Sliding.config({
                  dimension: {
                    property: 'height'
                  },
                  closedClass: 'demo-sliding-closed',
                  openClass: 'demo-sliding-open',
                  shrinkingClass: 'demo-sliding-height-shrinking',
                  growingClass: 'demo-sliding-height-growing',
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

              containerBehaviours: Behaviour.derive([
                Sliding.config({
                  dimension: {
                    property: 'width'
                  },
                  closedClass: 'demo-sliding-closed',
                  openClass: 'demo-sliding-open',
                  shrinkingClass: 'demo-sliding-width-shrinking',
                  growingClass: 'demo-sliding-width-growing',
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