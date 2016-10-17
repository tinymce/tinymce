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

      var groups = [
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
        },
        {
          label: 'group-2',
          components: [
            { type: 'button', text: 'Rho' },
            { type: 'button', text: 'Theta' }

          ]
        }
      ];

      var toolbar = HtmlDisplay.section(
        gui,
        'This toolbar has overflow behaviour that scrolls',
        {
          uiType: 'toolbar',
          groups: groups,
          overflowing: {
            mode: 'scroll',
            initWidth: '150px'
          }
        }
      );

      var toolbar2 = HtmlDisplay.section(
        gui,
        'This toolbar has overflow behaviour that uses a more drawer',
        {
          uiType: 'container',
          components: [
            {
              uiType: 'toolbar',
              uid: 'demo-more-toolbar',
              groups: groups,
              overflowing: {
                mode: 'more',
                initWidth: '100px',
                getDrawer: function () {
                  return gui.getByUid('demo-more-toolbar-drawer');
                }
              }
            }
          ]
          
        }
      );
    };
  }
);