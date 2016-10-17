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
            { type: 'button', text: 'Alpha', action: function () { } },
            { type: 'button', text: 'Beta', action: function () { } },
            { type: 'button', text: 'Gamma', action: function () { } }

          ]
        },

        {
          label: 'group-2',
          components: [
            { type: 'button', text: 'Delta', action: function () { } },
            { type: 'button', text: 'Epsilon', action: function () { } }

          ]
        },
        {
          label: 'group-2',
          components: [
            { type: 'button', text: 'Rho', action: function () { } },
            { type: 'button', text: 'Theta', action: function () { } }

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
          uiType: 'more.toolbar',
          uid: 'demo-more-toolbar',
          groups: groups,
          initWidth: '100px',
          dom: {
            styles: {
              // width: '300px',
              // display: 'flex',
              overflow: 'hidden'
            }
          }
        }
      );

      window.addEventListener('resize', function () {
        toolbar2.apis().refresh();
      });
    };
  }
);