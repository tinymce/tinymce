define(
  'ephox.alloy.demo.ToolbarsDemo',

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

      var toolbar = HtmlDisplay.section(
        gui,
        'This toolbar has overflow behaviour that scrolls',
        {
          uiType: 'toolbar',
          groups: [
            {
              label: 'group-1',
              components: [
                { type: 'button', text: 'Alpha' },
                { type: 'button', text: 'Beta' },
                { type: 'button', text: 'Gamma' }

              ]
            },

            {
              label: 'group-2',
              components: [
                { type: 'button', text: 'Delta' },
                { type: 'button', text: 'Epsilon' }

              ]
            }
          ],
          overflowing: {
            mode: 'scroll',
            initWidth: '150px'
          }
        }
      );
    };
  }
);