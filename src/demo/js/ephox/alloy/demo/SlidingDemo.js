define(
  'ephox.alloy.demo.SlidingDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, HtmlDisplay, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      HtmlDisplay.section(
        gui,
        'This container slides its height',
        {
          uiType: 'container',
          components: [
            {
              uiType: 'container',
              uid: 'height-slider',
              sliding: {
                mode: 'height',
                closedStyle: 'demo-sliding-closed',
                openStyle: 'demo-sliding-open',
                shrinkingStyle: 'demo-sliding-height-shrinking',
                growingStyle: 'demo-sliding-height-growing'
              },
              components: [
                {
                  uiType: 'container',
                  dom: {
                    styles: { height: '100px', background: 'blue' }
                  }
                }
              ]
            },

            {
              uiType: 'button',
              text: 'Toggle',
              action: function () {
                var slider = gui.getByUid('height-slider').getOrDie();
                if (slider.apis().hasGrown()) slider.apis().shrink();
                else slider.apis().grow();
              }
            }
          ]
        }
      );

      HtmlDisplay.section(
        gui,
        'This container slides its width',
        {
          uiType: 'container',
          components: [
            {
              uiType: 'container',
              uid: 'width-slider',
              sliding: {
                mode: 'width',
                closedStyle: 'demo-sliding-closed',
                openStyle: 'demo-sliding-open',
                shrinkingStyle: 'demo-sliding-width-shrinking',
                growingStyle: 'demo-sliding-width-growing'
              },
              components: [
                {
                  uiType: 'container',
                  dom: {
                    styles: { height: '100px', background: 'blue' }
                  }
                }
              ]
            },

            {
              uiType: 'button',
              text: 'Toggle',
              action: function () {
                var slider = gui.getByUid('width-slider').getOrDie();
                if (slider.apis().hasGrown()) slider.apis().shrink();
                else slider.apis().grow();
              }
            }
          ]
        }
      );
    };
  }
);