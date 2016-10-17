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
              uid: 'slider',
              sliding: { },
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

              }
            }
          ]
        }
      );


    };
  }
);